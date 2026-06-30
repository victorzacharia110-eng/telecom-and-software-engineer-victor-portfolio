import { ref } from "vue";
import { defineStore } from "pinia";
import api from "@/composables/api";

export const useContactStore = defineStore("contact", () => {
  const contacts = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const validationErrors = ref({});

  //  Frontend validation rules (matches backend)
  const validateForm = (payload) => {
    const errors = {};

    // Name validation
    if (!payload.name || payload.name.trim().length < 2) {
      errors.name = ["Name must be at least 2 characters."];
    } else if (payload.name.length > 100) {
      errors.name = ["Name must not exceed 100 characters."];
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!payload.email) {
      errors.email = ["A valid email address is required."];
    } else if (!emailRegex.test(payload.email)) {
      errors.email = ["Please enter a valid email address."];
    } else if (payload.email.length > 150) {
      errors.email = ["Email must not exceed 150 characters."];
    }

    // Company validation
    if (payload.company && payload.company.length > 100) {
      errors.company = ["Company name must not exceed 100 characters."];
    }

    // Service validation
    if (payload.service && payload.service.length > 100) {
      errors.service = ["Service must not exceed 100 characters."];
    }

    // Budget validation
    const validBudgets = ['<5k', '5k-15k', '15k-50k', '>50k'];
    if (payload.budget && !validBudgets.includes(payload.budget)) {
      errors.budget = ["Please select a valid budget range."];
    }

    // Message validation
    if (!payload.message || payload.message.trim().length < 20) {
      errors.message = ["Your message should be at least 20 characters."];
    } else if (payload.message.length > 2000) {
      errors.message = ["Message must not exceed 2000 characters."];
    }

    return errors;
  };

  // Admin: Fetch all contacts
  const fetchContacts = async () => {
    isLoading.value = true;
    error.value = null;
    validationErrors.value = {};

    try {
      const response = await api.get("/api/admin/contacts");
      const payload = response?.data ?? [];
      contacts.value = Array.isArray(payload) ? payload : [];
      return payload;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch contacts";
      error.value = errorMessage;
      
      //  Capture backend validation errors
      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors;
      }
      
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Admin: Get single contact
  const getContact = async (id) => {
    isLoading.value = true;
    error.value = null;
    validationErrors.value = {};

    try {
      const response = await api.get(`/api/admin/contacts/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to get contact";
      error.value = errorMessage;
      
      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors;
      }
      
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Public: Submit contact form with frontend validation
  const createContact = async (payload) => {
    isLoading.value = true;
    error.value = null;
    validationErrors.value = {};

    try {
      // Run frontend validation first
      const frontendErrors = validateForm(payload);
      if (Object.keys(frontendErrors).length > 0) {
        validationErrors.value = frontendErrors;
        error.value = "Please fix the errors below.";
        isLoading.value = false;
        throw new Error("Validation failed");
      }

      // If frontend validation passes, send to backend
      const response = await api.post("/api/contact", payload);
      contacts.value = [response.data, ...contacts.value];
      
      // Clear errors on success
      validationErrors.value = {};
      error.value = null;
      
      return response.data;
    } catch (err) {
      // Handle backend validation errors (422)
      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors;
        error.value = "Please fix the errors below.";
      } else if (err.response?.status === 429) {
        error.value = "Too many requests. Please wait a moment and try again.";
      } else if (err.response?.status === 403) {
        error.value = "You don't have permission to perform this action.";
      } else if (err.response?.status === 401) {
        error.value = "Please log in to continue.";
      } else if (err.message === "Validation failed") {
        // Frontend validation error, already handled above
        // Don't override the error
      } else {
        error.value = err.response?.data?.message || err.message || "Failed to send message";
      }
      
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Admin: Mark contact as read
  const markContactAsRead = async (id) => {
    isLoading.value = true;
    error.value = null;
    validationErrors.value = {};

    try {
      const response = await api.patch(`/api/admin/contacts/${id}/read`);
      contacts.value = contacts.value.map((contact) =>
        contact.id === id ? response.data : contact,
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to mark as read";
      error.value = errorMessage;
      
      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors;
      }
      
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Admin: Delete contact
  const deleteContact = async (id) => {
    isLoading.value = true;
    error.value = null;
    validationErrors.value = {};

    try {
      await api.delete(`/api/admin/contacts/${id}`);
      contacts.value = contacts.value.filter((contact) => contact.id !== id);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete contact";
      error.value = errorMessage;
      
      if (err.response?.status === 422 && err.response?.data?.errors) {
        validationErrors.value = err.response.data.errors;
      }
      
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Clear errors helper
  const clearErrors = () => {
    error.value = null;
    validationErrors.value = {};
  };

  return {
    contacts,
    isLoading,
    error,
    validationErrors,
    fetchContacts,
    getContact,
    createContact,
    markContactAsRead,
    deleteContact,
    clearErrors,
  };
});