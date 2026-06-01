import api from "@/lib/axios";

export const messCreationApi = async (formData: FormData) => {
  const res = await api.post("/onboard/create-mess", formData);
  return res;
};
