import { z } from "zod";

export const permissionFormSchema = z.object({
    permission: z.string().min(1, "Choose a permission"),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;

export type PermissionOption = {
    _id: string;
    code: string;
    description?: string;
    roles: string[];
};
