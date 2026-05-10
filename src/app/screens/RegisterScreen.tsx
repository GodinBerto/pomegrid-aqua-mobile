import React from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { registerUser } from "@/services/api";
import { Button, Card, Screen, SectionHeading, TextField } from "@/components/ui";

export const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (Object.values(form).some((value) => !value.trim())) {
      Alert.alert("Missing details", "Complete every field to create your user account.");
      return;
    }

    if (form.password.length < 8) {
      Alert.alert("Weak password", "Use at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Password mismatch", "Your password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);
    const response = await registerUser(form);
    setIsSubmitting(false);

    if (!response.success) {
      Alert.alert("Registration failed", response.message || "Please try again.");
      return;
    }

    Alert.alert("Account created", response.message || "You can sign in now.");
    navigation.replace("Login");
  };

  return (
    <Screen contentContainerClassName="justify-center flex-grow py-8">
      <Card className="gap-4">
        <SectionHeading
          eyebrow="Create account"
          title="Register as a user"
          description="This mobile build intentionally excludes admin and focuses on the customer-side flow only."
        />
        <TextField label="First name" value={form.firstName} onChangeText={(value) => handleChange("firstName", value)} />
        <TextField label="Last name" value={form.lastName} onChangeText={(value) => handleChange("lastName", value)} />
        <TextField
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(value) => handleChange("email", value)}
        />
        <TextField
          label="Phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(value) => handleChange("phone", value)}
        />
        <TextField
          label="Date of birth"
          placeholder="YYYY-MM-DD"
          value={form.dateOfBirth}
          onChangeText={(value) => handleChange("dateOfBirth", value)}
        />
        <TextField
          label="Password"
          secureTextEntry
          value={form.password}
          onChangeText={(value) => handleChange("password", value)}
        />
        <TextField
          label="Confirm password"
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(value) => handleChange("confirmPassword", value)}
        />
        <Button onPress={handleRegister} disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </Card>
    </Screen>
  );
};
