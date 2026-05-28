import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { theme } from "../constants/themes";
import CustomButton from "../components/common/CustomButton";
import AvatarPicker from "../components/feed/AvatarPicker";
import { userService } from "../services/userService";
import { cacheService } from "../services/cacheService";
import { appActions, useAppContext } from "../context/AppContext";
import { postService } from "../services/postService";
import { styles } from "./OnboardingScreen.styles";
import { useToast } from "../context/ToastContext";
import { moderationService } from "../services/moderationService";
import DismissKeyboard from "../components/common/DismissKeyboard";
import { pickImageFromLibrary } from "../utils/imagePicker";

export default function OnboardingScreen() {
  const { state, dispatch } = useAppContext();
  const uid = state.user?.uid;
  const { showToast } = useToast();
  const needsOnboarding = state.profile?.onboarded === false;
  const isEditing = state.profile?.onboarded === true;

  const initial = useMemo(() => {
    return {
      username: String(state.profile?.username || "").trim(),
      bio: String(state.profile?.bio || "").trim(),
      avatar: state.profile?.avatar || "cat",
      avatarUrl: state.profile?.avatarUrl || null,
    };
  }, [state.profile]);

  const [step, setStep] = useState(needsOnboarding ? "intro" : "profile"); // intro | profile
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [dirty, setDirty] = useState(false);

  // If profile loads after navigation (common with Firebase), hydrate the form once.
  useEffect(() => {
    if (dirty || isSaving) return;
    if (initial.username && !String(username || "").trim()) setUsername(initial.username);
    if (initial.bio && !String(bio || "").trim()) setBio(initial.bio);
    if (initial.avatar && avatar === "cat") setAvatar(initial.avatar);
    if (initial.avatarUrl && !avatarUrl) setAvatarUrl(initial.avatarUrl);
  }, [avatar, avatarUrl, bio, dirty, initial, isSaving, username]);

  useEffect(() => {
    // If the profile loads later, ensure first-time users see the intro.
    setStep(needsOnboarding ? "intro" : "profile");
  }, [needsOnboarding]);

  const save = useCallback(() => {
    (async () => {
      try {
        if (!uid) {
          showToast("Session missing. Please sign in again.", { type: "error" });
          router.replace("/(auth)/Login");
          return;
        }

        const desiredUsername = String(username || "").trim().toLowerCase();
        const cleanBio = String(bio || "").trim();

        if (!isEditing && !/^[a-z0-9_]{3,20}$/.test(desiredUsername)) {
          showToast("Use 3-20 letters/numbers/underscore only.", { type: "error" });
          return;
        }

        setIsSaving(true);

        const moderationChecks = [{ field: "bio", text: cleanBio }];
        if (!isEditing) {
          moderationChecks.push({ field: "username", text: desiredUsername });
        }

        const moderationResult = await moderationService.checkTexts(moderationChecks);
        if (!moderationResult.ok) {
          showToast(`This word is blocked: "${moderationResult.word}"`, { type: "error" });
          return;
        }

        let me = null;

        if (isEditing) {
          me = await userService.updateProfile({
            bio: cleanBio,
            avatar,
            avatarUrl,
          });
        } else {
          me = await userService.completeOnboarding({
            username: desiredUsername,
            bio: cleanBio,
            avatar,
            avatarUrl,
          });
        }

        if (!me?.id) throw new Error("Could not save profile");

        const updates = {
          uid: me.id,
          email: me.email,
          role: me.role,
          banned: !!me.banned,
          onboarded: !!me.onboarded,
          username: me.username || "",
          nickname: me.nickname || "@anonymous",
          bio: me.bio || "",
          avatar: me.avatar || "cat",
          avatarUrl: me.avatarUrl || null,
          createdAt: me.createdAt || state.profile?.createdAt || null,
        };

        dispatch(appActions.setProfile(updates));
        dispatch(appActions.setAuthorProfile(updates));
        dispatch(appActions.setRole(updates.role));
        dispatch(appActions.setUser({ uid: updates.uid, email: updates.email }));
        dispatch(appActions.updatePostsAuthor(uid, {
          nickname: updates.nickname,
          avatar: updates.avatar,
          avatarUrl: updates.avatarUrl,
        }));

        showToast(isEditing ? "Profile updated!" : "Profile saved!", { type: "success" });
        router.replace(updates.role === "admin" ? "/(admin)" : "/(tabs)/Home");

        Promise.allSettled([
          postService.updateUserPostsAuthor(uid, updates),
          cacheService.saveUser(updates),
          cacheService.updatePostsAuthor(uid, {
            nickname: updates.nickname,
            avatar: updates.avatar,
            avatarUrl: updates.avatarUrl,
          }),
        ]);
      } catch (e) {
        showToast(e?.message || "Could not save profile. Try again.", { type: "error" });
      } finally {
        setIsSaving(false);
      }
    })();
  }, [avatar, avatarUrl, bio, dispatch, isEditing, showToast, state.profile, state.role, state.user?.email, uid, username]);

  const handleAvatarUpload = useCallback(() => {
    (async () => {
      if (!uid) {
        showToast("Session missing. Please sign in again.", { type: "error" });
        router.replace("/(auth)/Login");
        return;
      }

      try {
        setIsUploadingAvatar(true);
        const { cancelled, file, error } = await pickImageFromLibrary();
        if (cancelled) {
          if (error) showToast(error, { type: "error" });
          return;
        }

        const me = await userService.uploadAvatar(file);
        if (!me?.id) throw new Error("Could not update profile photo.");

        setAvatarUrl(me.avatarUrl || null);
        const updates = {
          uid: me.id,
          email: me.email,
          role: me.role,
          banned: !!me.banned,
          onboarded: !!me.onboarded,
          username: me.username || "",
          nickname: me.nickname || "@anonymous",
          bio: me.bio || "",
          avatar: me.avatar || avatar || "cat",
          avatarUrl: me.avatarUrl || null,
          createdAt: me.createdAt || state.profile?.createdAt || null,
          updatedAt: me.updatedAt || null,
        };
        dispatch(appActions.setProfile(updates));
        dispatch(appActions.setAuthorProfile(updates));
        dispatch(
          appActions.updatePostsAuthor(uid, {
            nickname: updates.nickname,
            avatar: updates.avatar,
            avatarUrl: updates.avatarUrl,
          })
        );
        Promise.allSettled([
          cacheService.saveUser(updates),
          cacheService.updatePostsAuthor(uid, {
            nickname: updates.nickname,
            avatar: updates.avatar,
            avatarUrl: updates.avatarUrl,
          }),
        ]);
        showToast("Profile photo updated!", { type: "success" });
        setShowAvatarPicker(false);
      } catch (e) {
        showToast(e?.message || "Could not upload photo. Try again.", { type: "error" });
      } finally {
        setIsUploadingAvatar(false);
      }
    })();
  }, [avatar, dispatch, showToast, state.profile?.createdAt, uid]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <DismissKeyboard>
          {step === "intro" ? (
            <>
              <Text style={styles.title}>Welcome to Bubble</Text>
              <Text style={styles.subtitle}>
                Share thoughts for 24 hours, react, and keep it kind.
              </Text>

              <View style={styles.card}>
                <Text style={styles.label}>Quick overview</Text>
                <Text style={styles.helper}>
                  • Posts expire after 24 hours{"\n"}
                  • React with emojis{"\n"}
                  • Comment + repost{"\n"}
                  • Reports are reviewed by admins
                </Text>
              </View>

              <CustomButton
                title="Set up my profile"
                variant="primary"
                onPress={() => setStep("profile")}
                style={styles.primaryButton}
              />

              <TouchableOpacity
                onPress={() => setStep("profile")}
                activeOpacity={0.85}
                style={{ marginTop: 12 }}
              >
                <Text style={[styles.helper, { textAlign: "center" }]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>{isEditing ? "Edit Profile" : "Set Up Your Profile"}</Text>
              <Text style={styles.subtitle}>
                {isEditing
                  ? "Update your bio and avatar. Username can’t be changed."
                  : "Choose your username (one-time)."}
              </Text>

              <View style={styles.card}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={[styles.input, isEditing && styles.inputDisabled]}
                  value={username}
                  onChangeText={(v) => {
                    if (isEditing) return;
                    setDirty(true);
                    setUsername(String(v || "").toLowerCase());
                  }}
                  placeholder="username"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  editable={!isEditing}
                />
                <Text style={styles.helper}>
                  3-20 letters/numbers/underscore. You can only choose once.
                </Text>

                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={bio}
                  onChangeText={(v) => {
                    setDirty(true);
                    setBio(v);
                  }}
                  placeholder="Say something about yourself..."
                  placeholderTextColor={theme.colors.textMuted}
                  maxLength={140}
                  multiline
                />

                <Text style={styles.label}>Avatar</Text>
                <CustomButton
                  title="Choose Avatar"
                  variant="secondary"
                  onPress={() => setShowAvatarPicker(true)}
                  style={styles.button}
                />
              </View>

              <CustomButton
                title={isSaving ? "Saving..." : "Continue"}
                variant="primary"
                onPress={save}
                disabled={isSaving}
                style={styles.primaryButton}
              />
            </>
          )}
        </DismissKeyboard>
      </ScrollView>

      <AvatarPicker
        visible={showAvatarPicker}
        selectedAvatar={avatar}
        onSelect={(key) => {
          setAvatar(key);
          setAvatarUrl(null);
          setShowAvatarPicker(false);
        }}
        onClose={() => setShowAvatarPicker(false)}
        onUploadPress={handleAvatarUpload}
        uploading={isUploadingAvatar}
      />
    </SafeAreaView>
  );
}
