import { auth } from "@/lib/auth";

export default auth((req) => {
  return;
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
