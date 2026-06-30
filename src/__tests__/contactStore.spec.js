import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import api from "../composables/api";
import { useContactStore } from "../stores/contact";

vi.mock("../composables/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("useContactStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("fetches, creates, updates, and deletes contacts", async () => {
    api.get.mockImplementation(async (url) => {
      if (url === "/csrf-cookie") return {};
      if (url === "/api/contacts") return { data: [] };
      if (url === "/api/contacts/1") return { data: { id: 1, name: "Ada" } };
      throw new Error(`Unexpected URL: ${url}`);
    });
    api.post.mockResolvedValue({ data: { id: 1, name: "Ada" } });
    api.put.mockResolvedValue({ data: { id: 1, name: "Ada Lovelace" } });
    api.delete.mockResolvedValue({});

    const store = useContactStore();
    await store.fetchContacts();
    await store.createContact({ name: "Ada" });
    await store.updateContact(1, { name: "Ada Lovelace" });
    await store.deleteContact(1);

    expect(api.get).toHaveBeenCalledWith("/csrf-cookie");
    expect(api.get).toHaveBeenCalledWith("/api/contacts");
    expect(api.post).toHaveBeenCalledWith("/api/contacts", { name: "Ada" });
    expect(api.put).toHaveBeenCalledWith("/api/contacts/1", { name: "Ada Lovelace" });
    expect(api.delete).toHaveBeenCalledWith("/api/contacts/1");
    expect(store.contacts).toEqual([]);
  });
});
