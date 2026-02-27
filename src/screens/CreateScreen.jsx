import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
// Import React Hook Form
import { useForm, Controller } from "react-hook-form";
import TagChip from "../components/feed/TagChip";
import CustomButton from "../components/common/CustomButton";
import { theme } from "../constants/themes";
import { createPost } from "../services/postService";
import { formatRequestError } from "../utils/requestState";

export default function CreateScreen() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      text: "",
    },
  });

  // Remove # from tag names since TagChip adds it automatically
  const availableTags = [
    "college",
    "tech",
    "mentalhealth",
    "life",
    "coding",
    "motivation",
    "fyp",
    "rant",
  ];

  const handleTagToggle = (tag) => {
    let newSelectedTags;
    if (selectedTags.includes(tag)) {
      newSelectedTags = selectedTags.filter((t) => t !== tag);
    } else if (selectedTags.length < 3) {
      newSelectedTags = [...selectedTags, tag];
    } else {
      Alert.alert("Limit", "You can only select up to 3 tags");
      return;
    }
    setSelectedTags(newSelectedTags);
  };

  // Updated onSubmit handler
  const onSubmit = async (formData) => {
    // Validate tags separately as they are not a standard input
    if (selectedTags.length === 0) {
      Alert.alert("Error", "Please select at least one tag");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({
        text: formData.text.trim(),
        tags: selectedTags,
      });

      setSubmitError("");
      reset();
      setSelectedTags([]);
      Alert.alert("Success!", "Your bubble has been posted anonymously", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message = formatRequestError(error, "Unable to post bubble.");
      setSubmitError(message);
      Alert.alert("Post Failed", message);
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
        {/* Top Spacing */}
        <View style={styles.topSpacing} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.colors.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Create Bubble</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Info Banner */}
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

        {/* Text Input using RHF Controller */}
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
                style={[
                  styles.textInput,
                  errors.text && styles.inputError, // Apply error style
                ]}
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
              {/* Display error message for text input */}
              {errors.text && (
                <Text style={styles.errorText}>{errors.text.message}</Text>
              )}
            </>
          )}
        />

        {/* Tags Selection */}
        <Text style={styles.sectionTitle}>Select up to 3 tags</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          contentContainerStyle={styles.tagsContainer}
        >
          {availableTags.map((tag) => (
            <TagChip
              key={tag}
              tag={tag}
              selected={selectedTags.includes(tag)}
              onPress={() => handleTagToggle(tag)}
            />
          ))}
        </ScrollView>
        <Text style={styles.tagsCount}>{selectedTags.length}/3 selected</Text>
        {/* You could add a tag validation error message here if needed */}

        {/* Submit Button */}
        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
        <CustomButton
          title={isSubmitting ? "Posting..." : "Post Bubble"}
          variant="primary"
          onPress={handleSubmit(onSubmit)} // Use RHF's handleSubmit
          disabled={isSubmitting}
          style={styles.submitButton}
        />

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <MaterialIcons name="lock" size={16} color={theme.colors.textMuted} />
          <Text style={styles.privacyText}>
            Completely anonymous • 24-hour lifespan • No personal data stored
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bgWhite,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgWhite,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  topSpacing: {
    height: 30,
  },
  bottomSpacing: {
    height: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.textDark,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.bgSoft,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textMuted,
    flex: 1,
    fontSize: theme.fontSize.sm,
  },
  textInput: {
    backgroundColor: theme.colors.bgCream,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textDark,
    minHeight: 160,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    lineHeight: 22,
  },
  // Style for input error state
  inputError: {
    borderColor: theme.colors.errorRed, // Use your theme's error color
  },
  // Style for error message text
  errorText: {
    color: theme.colors.errorRed,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fontFamily.regular,
  },
  charCount: {
    textAlign: "right",
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.bold,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    color: theme.colors.textDark,
  },
  tagsScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  tagsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  tagsCount: {
    textAlign: "center",
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  },
  submitError: {
    marginTop: theme.spacing.md,
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.fontFamily.regular,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgSoft,
    borderRadius: theme.borderRadius.md,
  },
  privacyText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
    flex: 1,
    lineHeight: 18,
  },
});
