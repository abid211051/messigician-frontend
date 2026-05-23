import api from "@/lib/axios";

export const searchSubMessListApi = async (mess_id: string) => {
  const res = await api.get(`/onboard/sub-mess-list/${mess_id}`);
  return res;
};

export const joinRequestApi = async ({
  mess_id,
  sub_mess_id,
}: {
  mess_id: string;
  sub_mess_id: string;
}) => {
  const res = await api.post("/onboard/join-request", { mess_id, sub_mess_id });
  return res;
};
