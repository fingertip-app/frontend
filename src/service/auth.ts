const SUPABASE_URL = "https://eozmdmuzlhyanrwhyaqd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvem1kbXV6bGh5YW5yd2h5YXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTQ3MTAsImV4cCI6MjA5NTg3MDcxMH0.LrheS27SeXcr2qtacW9fBqynogp8LnMwRyQ3JCkp5go";

// 회원가입
export const signupAPI = async (email: string, password: string) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// 로그인
export const loginEmailAPI = async (email: string, password: string) => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};