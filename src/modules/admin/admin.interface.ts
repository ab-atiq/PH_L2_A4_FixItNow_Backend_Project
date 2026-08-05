export type TUpdateUserStatusBody = {
  activeStatus: "ACTIVE" | "BLOCKED";
};

export type TCreateCategoryBody = {
  categoryName: string;
  description?: string;
};
