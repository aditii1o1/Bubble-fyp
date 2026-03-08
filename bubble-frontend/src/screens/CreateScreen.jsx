import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import CustomButton from "../components/common/CustomButton";
import { theme } from "../constants/themes";
import { appActions, useAppContext } from "../context/AppContext";
import TagSelector from "../components/create/TagSelector";
import { styles } from "./CreateScreen.styles";
import { postService } from "../services/postService";
import { cacheService } from "../services/cacheService";
import { TAGS } from "../constants/tags";
import { useToast } from "../context/ToastContext";
import { moderationService } from "../services/moderationService";
import DismissKeyboard from "../components/common/DismissKeyboard";

export default function CreateScreen() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state, dispatch } = useAppContext();
  const { showToast } = useToast();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const prefs = (await cacheService.getPrefs()) || {};
        const saved = Array.isArray(prefs.customTags) ? prefs.customTags : [];
        if (alive) setCustomTags(saved.map((t) => String(t || "").trim()).filter(Boolean));
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const allTags = useMemo(() => {
    const set = new Set([...(TAGS || []), ...(customTags || [])]);
    return Array.from(set);
  }, [customTags]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      text: "",
    },
  });

  const handleTagToggle = useCallback((tag) => {
    let newSelectedTags;
    if (selectedTags.includes(tag)) {
      newSelectedTags = selectedTags.filter((t) => t !== tag);
    } else if (selectedTags.length < 3) {
      newSelectedTags = [...selectedTags, tag];
    } else {
      showToast("You can only select up to 3 tags", { type: "error" });
      return;
    }
    setSelectedTags(newSelectedTags);
  }, [selectedTags, showToast]);

  const handleAddCustomTag = useCallback((tag) => {
    const t = String(tag || "").trim().toLowerCase();
    if (!t) return;

    setCustomTags((prev) => {
      const next = Array.from(new Set([...(prev || []), t])).slice(0, 50);
      void (async () => {
        try {
          const prefs = (await cacheService.getPrefs()) || {};
          await cacheService.savePrefs({ ...prefs, customTags: next });
        } catch {
          // ignore
        }
      })();
      return next;
    });

    handleTagToggle(t);
  }, [handleTagToggle]);

  const onSubmit = async (formData) => {
    if (selectedTags.length === 0) {
      showToast("Please select at least one tag", { type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      const uid = state.user?.uid;
      if (!uid) {
        showToast("You must be logged in to post.", { type: "error" });
        return;
      }

      const check = await moderationService.checkText(
        `${String(formData.title || "")} ${String(formData.text || "")}`
      );
      if (!check.ok) {
        showToast(`This word is blocked: "${check.word}"`, { type: "error" });
        return;
      }

      const email = String(state.user?.email || "")
        .trim()
        .toLowerCase();
      const nickname = state.profile.nickname || "@anonymous";
      const now = Date.now();
      const createdAt = new Date(now).toISOString();
      const expiresAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
      const tempId = `temp_${now}`;

        const optimistic = {
        id: tempId,
        userId: uid,
        nickname,
        avatar: state.profile.avatar || "cat",
        avatarUrl: state.profile.avatarUrl || null,
        title: String(formData.title || "").trim(),
        text: String(formData.text || "").trim(),
        tags: selectedTags.slice(0, 3),
        reactions: { heart: 0 },
        commentCount: 0,
        comments: 0,
        viewCount: 0,
        createdAt,
        expiresAt,
      };

      dispatch(appActions.addPost(optimistic));
      reset();
      setSelectedTags([]);
      setIsSubmitting(false);
      showToast("Posted!", { type: "success" });
      // This is a tab screen, so `back()` may do nothing. Always go to Home after posting.
      router.replace("/(tabs)/Home");

      // Save to Firestore in background so the form doesn't get stuck on "Posting...".
      void (async () => {
        try {
          const created = await postService.createPost({
            uid,
            nickname,
            avatar: state.profile.avatar || "cat",
            avatarUrl: state.profile.avatarUrl || null,
            title: optimistic.title,
            text: optimistic.text,
            tags: optimistic.tags,
          });
          dispatch(appActions.replacePost(tempId, created));
          try {
            const existing = (await cacheService.getPosts()) || [];
            await cacheService.savePosts([created, ...existing].slice(0, 20));
          } catch {
            // ignore cache failures
          }
        } catch (e) {
          dispatch(appActions.deletePost(tempId));
          showToast(e?.message || "Could not post. Try again.", { type: "error" });
        }
      })();
    } catch (e) {
      console.error("Create post error:", e);
      showToast(e?.message || "Something went wrong", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <DismissKeyboard>
          <View style={styles.topSpacing} />

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={theme.colors.textDark}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Create Bubble</Text>
            <View style={styles.iconSpacer} />
          </View>

        <View style={styles.infoBanner}>
          <MaterialIcons
            name="info"
            size={18}
            color={theme.colors.primaryPink}
          />
          <Text style={styles.infoText}>
            Your bubble will be visible for 24 hours only
          </Text>
        </View>

        <Controller
          control={control}
          name="title"
          rules={{
            required: "Title is required",
            maxLength: { value: 60, message: "Title must be 60 characters or less" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor={theme.colors.textMuted}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={60}
                returnKeyType="next"
              />
              {errors.title ? (
                <Text style={styles.errorText}>{errors.title.message}</Text>
              ) : null}
            </>
          )}
        />

        <Controller
          control={control}
          name="text"
          rules={{
            required: "Please write something",
            maxLength: {
              value: 1000,
              message: "Text must be 1000 characters or less",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                style={[styles.textInput, errors.text && styles.inputError]}
                placeholder="What's on your mind? Share anonymously..."
                placeholderTextColor={theme.colors.textMuted}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={8}
                maxLength={1000}
                textAlignVertical="top"
              />
              {errors.text && (
                <Text style={styles.errorText}>{errors.text.message}</Text>
              )}
            </>
          )}
        />
        <TagSelector
          tags={allTags}
          selectedTags={selectedTags}
          onToggleTag={handleTagToggle}
          maxSelected={3}
          onAddCustomTag={handleAddCustomTag}
        />
        <CustomButton
          title={isSubmitting ? "Posting..." : "Post Bubble"}
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
        <View style={styles.privacyNote}>
          <MaterialIcons name="lock" size={16} color={theme.colors.textMuted} />
          <Text style={styles.privacyText}>
            Email stays hidden • 24-hour lifespan • Post anonymously
          </Text>
        </View>

          <View style={styles.bottomSpacing} />
        </DismissKeyboard>
      </ScrollView>
    </SafeAreaView>
  );
}
