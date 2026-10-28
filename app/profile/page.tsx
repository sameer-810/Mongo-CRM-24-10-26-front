import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/auth-config";
import { ProfileForm } from "@/components/profile/profile-form";
import { SITE } from "@/lib/site";

export const metadata = {
  title: `Profile | ${SITE.name}`,
  description: "Manage your profile and settings",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Type assertion since we extended the session type
  const user = session.user as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    isPasswordChanged: boolean;
    id: string;
  };

  return <ProfileForm user={user} />;
}
