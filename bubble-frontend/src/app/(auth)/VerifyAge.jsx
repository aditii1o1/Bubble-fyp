import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import MlkitOcr from "react-native-mlkit-ocr";
import { router, useLocalSearchParams } from "expo-router";
import AuthLayout from "../../components/common/AuthLayout";
import CustomButton from "../../components/common/CustomButton";
import { appActions, useAppContext } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { styles } from "../../screens/auth/VerifyAge.styles";
import { authService } from "../../services/authService";
import { pendingSignupService } from "../../services/pendingSignupService";
import { getAuthenticatedHref } from "../../utils/authRedirect";
import { getAuthErrorMessage } from "../../utils/authError";
import { isAtLeast18, validateScannedIdText } from "../../utils/ageVerification";

function getParamValue(value) {
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

function collectTextSegments(node, segments) {
  if (!node) return;

  if (typeof node === "string") {
    const trimmed = node.trim();
    if (trimmed) segments.push(trimmed);
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item) => collectTextSegments(item, segments));
    return;
  }

  if (typeof node !== "object") return;

  ["text", "value", "lineText"].forEach((key) => {
    const value = node[key];
    if (typeof value === "string" && value.trim()) {
      segments.push(value.trim());
    }
  });

  ["blocks", "lines", "elements", "components", "items"].forEach((key) => {
    collectTextSegments(node[key], segments);
  });
}

function getRecognizedText(result) {
  const segments = [];
  collectTextSegments(result, segments);

  return Array.from(
    new Set(segments.map((item) => String(item || "").trim()).filter(Boolean)),
  ).join("\n");
}

function getOcrErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("permission")) {
    return "Camera permission was denied. Allow camera access or choose an image from your gallery.";
  }

  if (
    message.includes("detectfromuri") ||
    message.includes("native module") ||
    message.includes("null is not an object")
  ) {
    return "OCR is not available in this build yet. Rebuild the Android app and try again.";
  }

  return "We could not scan that ID clearly. Try a brighter photo with the date of birth fully visible.";
}

function getMediaErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("permission")) {
    return "Permission was denied. Allow access and try again.";
  }

  if (message.includes("cancel")) {
    return "";
  }

  return "Something went wrong while opening the camera or gallery. Please try again.";
}

function getResultTone(type) {
  switch (type) {
    case "pass":
      return {
        container: styles.passCard,
        badge: styles.passBadge,
        badgeText: styles.passBadgeText,
      };
    case "fail":
      return {
        container: styles.failCard,
        badge: styles.failBadge,
        badgeText: styles.failBadgeText,
      };
    default:
      return {
        container: styles.retryCard,
        badge: styles.retryBadge,
        badgeText: styles.retryBadgeText,
      };
  }
}

function buildResult(type, config = {}) {
  return {
    type,
    badge: config.badge || "TRY AGAIN",
    heading: config.heading || "Verification incomplete",
    message: config.message || "",
    dob: config.dob || "",
  };
}

function getValidationFailureConfig(validation) {
  switch (validation?.code) {
    case "text_too_short":
      return {
        badge: "TRY AGAIN",
        heading: "Not enough text detected",
        message: validation.message,
      };
    case "missing_id_keywords":
      return {
        badge: "TRY AGAIN",
        heading: "Not a valid ID",
        message: validation.message,
      };
    case "insufficient_fields":
      return {
        badge: "TRY AGAIN",
        heading: "Incomplete ID details",
        message: validation.message,
      };
    case "dob_not_found":
      return {
        badge: "TRY AGAIN",
        heading: "Date of birth not found",
        message: validation.message,
      };
    default:
      return {
        badge: "TRY AGAIN",
        heading: "Could not verify age",
        message:
          validation?.message ||
          "We could not validate this ID. Please try again with a clearer image.",
      };
  }
}

export default function VerifyAgeScreen() {
  const cameraRef = useRef(null);
  const { dispatch } = useAppContext();
  const { showToast } = useToast();
  const { pendingKey } = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedImageUri, setSelectedImageUri] = useState("");
  const [result, setResult] = useState(null);
  const [rawScannedText, setRawScannedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompletingSignup, setIsCompletingSignup] = useState(false);

  const safePendingKey = getParamValue(pendingKey);
  const signupData = pendingSignupService.get(safePendingKey);

  const resetScanState = () => {
    setSelectedImageUri("");
    setRawScannedText("");
    setResult(null);
  };

  const handleScanImage = async (uri) => {
    if (!uri) return;

    setIsProcessing(true);
    setSelectedImageUri(uri);
    setRawScannedText("");
    setResult(null);

    try {
      if (!MlkitOcr?.detectFromUri) {
        throw new Error("detectFromUri is not available");
      }

      const blocks = await MlkitOcr.detectFromUri(uri);
      const text = getRecognizedText(blocks);
      setRawScannedText(text);

      if (!text) {
        setResult(
          buildResult("retry", {
            badge: "TRY AGAIN",
            heading: "No text detected",
            message: "We could not read any text from this ID. Try a clearer image with better lighting.",
          }),
        );
        return;
      }

      const validation = validateScannedIdText(text);

      if (!validation.isValid) {
        setResult(
          buildResult("retry", getValidationFailureConfig(validation)),
        );
        return;
      }

      const { dob } = validation;

      if (!isAtLeast18(dob.date)) {
        setResult(
          buildResult("fail", {
            badge: "FAIL",
            heading: "You must be 18 or older",
            message: "This signup is blocked because the detected date of birth is under 18.",
            dob: dob.formatted,
          }),
        );
        return;
      }

      setResult(
        buildResult("pass", {
          badge: "PASS",
          heading: "Age verified",
          message: "We detected a valid date of birth. You can finish creating your account.",
          dob: dob.formatted,
        }),
      );
    } catch (error) {
      setResult(
        buildResult("retry", {
          badge: "TRY AGAIN",
          heading: "Could not verify age",
          message: getOcrErrorMessage(error),
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTakePhoto = async () => {
    if (isProcessing || isCompletingSignup) return;

    try {
      let currentPermission = permission;
      if (!currentPermission?.granted) {
        currentPermission = await requestPermission();
      }

      if (!currentPermission?.granted) {
        setResult(
          buildResult("retry", {
            badge: "CAMERA",
            heading: "Camera permission needed",
            message: "Allow camera access to scan an ID, or choose an image from your gallery instead.",
          }),
        );
        return;
      }

      const photo = await cameraRef.current?.takePictureAsync({ quality: 1 });

      if (!photo?.uri) {
        setResult(
          buildResult("retry", {
            badge: "TRY AGAIN",
            heading: "Capture failed",
            message: "We could not capture the ID image. Please try again.",
          }),
        );
        return;
      }

      await handleScanImage(photo.uri);
    } catch (error) {
      const message = getMediaErrorMessage(error);
      if (!message) return;

      setResult(
        buildResult("retry", {
          badge: "TRY AGAIN",
          heading: "Could not open camera",
          message,
        }),
      );
    }
  };

  const handleChooseFromGallery = async () => {
    if (isProcessing || isCompletingSignup) return;

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setResult(
          buildResult("retry", {
            badge: "GALLERY",
            heading: "Gallery permission needed",
            message: "Allow gallery access to choose an ID image, or use the camera instead.",
          }),
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (pickerResult.canceled) return;

      const asset = Array.isArray(pickerResult.assets)
        ? pickerResult.assets[0]
        : null;

      if (!asset?.uri) {
        setResult(
          buildResult("retry", {
            badge: "TRY AGAIN",
            heading: "No image selected",
            message: "Choose a clear photo of an ID to continue.",
          }),
        );
        return;
      }

      await handleScanImage(asset.uri);
    } catch (error) {
      const message = getMediaErrorMessage(error);
      if (!message) return;

      setResult(
        buildResult("retry", {
          badge: "TRY AGAIN",
          heading: "Could not open gallery",
          message,
        }),
      );
    }
  };

  const handleCompleteSignup = async () => {
    if (!signupData?.email || !signupData?.password) {
      showToast("Your signup details expired. Please fill the form again.", {
        type: "error",
      });
      router.replace("/(auth)/Signup");
      return;
    }

    setIsCompletingSignup(true);

    try {
      const signupResult = await authService.signup({
        email: signupData.email,
        password: signupData.password,
      });

      pendingSignupService.clear(safePendingKey);

      if (signupResult?.autoSignedIn && signupResult?.profile) {
        dispatch(appActions.setProfile(signupResult.profile));
        dispatch(
          appActions.login(
            {
              email: signupResult.profile.email,
              uid: signupResult.user?.uid,
            },
            signupResult.profile.role || "user",
          ),
        );

        showToast("Age verified and account created!", { type: "success" });
        router.replace(
          getAuthenticatedHref({
            role: signupResult.profile.role,
            onboarded: signupResult.profile.onboarded,
          }),
        );
        return;
      }

      showToast("Account created. Verify your email, then sign in.", {
        type: "success",
      });
      router.replace("/(auth)/Login");
    } catch (error) {
      showToast(getAuthErrorMessage(error), { type: "error" });
    } finally {
      setIsCompletingSignup(false);
    }
  };

  const tone = getResultTone(result?.type);

  if (!signupData?.email || !signupData?.password) {
    return (
      <AuthLayout scrollable>
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step 2 of 2</Text>
          </View>
          <Text style={styles.title}>Verify Your Age</Text>
          <Text style={styles.subtitle}>
            We could not find your signup details. Start the signup flow again
            to continue.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Verification required</Text>
            <Text style={styles.noteText}>
              Bubble needs a valid date of birth check before creating an
              account.
            </Text>
          </View>

          <CustomButton
            title="Back to Signup"
            onPress={() => router.replace("/(auth)/Signup")}
            style={styles.primaryButton}
          />
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout scrollable>
      <View style={styles.header}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step 2 of 2</Text>
        </View>
        <Text style={styles.title}>Verify Your Age</Text>
        <Text style={styles.subtitle}>
          Scan a government ID so we can confirm you are 18 or older.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>What we use</Text>
          <Text style={styles.noteText}>
            We only use the date of birth needed for age verification. Make
            sure the full ID is visible, including the name, ID number, and
            date of birth.
          </Text>
        </View>

        <View style={styles.cameraCard}>
          {permission === null ? (
            <View style={styles.cameraPlaceholder}>
              <ActivityIndicator size="large" color="#ED5E87" />
              <Text style={styles.placeholderTitle}>Checking camera access</Text>
              <Text style={styles.placeholderText}>
                Please wait while we prepare the scanner.
              </Text>
            </View>
          ) : permission?.granted ? (
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.placeholderTitle}>Camera access is optional</Text>
              <Text style={styles.placeholderText}>
                Allow camera access to scan now, or use a saved ID photo from
                your gallery.
              </Text>
              <CustomButton
                title="Enable Camera"
                onPress={handleTakePhoto}
                disabled={isProcessing || isCompletingSignup}
                style={styles.inlineButton}
              />
            </View>
          )}

          {isProcessing ? (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.processingText}>Reading date of birth...</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.helperText}>
          Use a flat, well-lit photo and keep the entire ID inside the frame so
          OCR can read the key details.
        </Text>

        <View style={styles.actions}>
          <CustomButton
            title="Scan with Camera"
            onPress={handleTakePhoto}
            disabled={isProcessing || isCompletingSignup}
            style={styles.primaryButton}
          />
          <CustomButton
            title="Choose from Gallery"
            variant="outline"
            onPress={handleChooseFromGallery}
            disabled={isProcessing || isCompletingSignup}
          />
        </View>

        {selectedImageUri ? (
          <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
        ) : null}

        {result ? (
          <View style={[styles.resultCard, tone.container]}>
            <View style={[styles.resultBadge, tone.badge]}>
              <Text style={[styles.resultBadgeText, tone.badgeText]}>
                {result.badge}
              </Text>
            </View>

            <Text style={styles.resultHeading}>{result.heading}</Text>
            <Text style={styles.resultMessage}>{result.message}</Text>

            {result.dob ? (
              <View style={styles.dobRow}>
                <Text style={styles.dobLabel}>Detected DOB</Text>
                <Text style={styles.dobValue}>{result.dob}</Text>
              </View>
            ) : null}

            {result.type === "pass" ? (
              <View style={styles.resultActions}>
                <CustomButton
                  title="Complete Signup"
                  onPress={handleCompleteSignup}
                  loading={isCompletingSignup}
                  disabled={isProcessing || isCompletingSignup}
                  style={styles.primaryButton}
                />
                <CustomButton
                  title="Scan Again"
                  variant="outline"
                  onPress={resetScanState}
                  disabled={isProcessing || isCompletingSignup}
                />
              </View>
            ) : result.type === "fail" ? (
              <View style={styles.resultActions}>
                <CustomButton
                  title="Back to Signup"
                  variant="outline"
                  onPress={() => router.replace("/(auth)/Signup")}
                  disabled={isProcessing || isCompletingSignup}
                />
              </View>
            ) : (
              <View style={styles.resultActions}>
                <CustomButton
                  title="Try Again"
                  onPress={resetScanState}
                  disabled={isProcessing || isCompletingSignup}
                  style={styles.primaryButton}
                />
              </View>
            )}
          </View>
        ) : null}

        {__DEV__ && rawScannedText ? (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>Raw OCR Text (Dev Only)</Text>
            <Text selectable style={styles.debugText}>
              {rawScannedText}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backLink}
        >
          <Text style={styles.backLinkText}>Back to Signup</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
