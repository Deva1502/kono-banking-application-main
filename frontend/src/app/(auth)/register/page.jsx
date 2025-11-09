"use client";
import { useEffect, useMemo, useState } from "react";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { axiosClient } from "@/utils/AxiosClient";
import { useMainContext } from "@/context/MainContext";
import CustomAuthButton from "@/components/reuseable/CustomAuthButton";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(8, "Min 8 characters").required("Password is required"),
  ac_type: yup.string().oneOf(["saving", "current"], "Choose Saving or Current").required("Account type is required"),
});

export default function RegisterPage() {
  const { user, fetchUserProfile } = useMainContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Redirect away if already logged in
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const initialValues = useMemo(
    () => ({ name: "", email: "", password: "", ac_type: "" }),
    []
  );

  const onSubmit = async (values, helpers) => {
    try {
      setLoading(true);
      const payload = { ...values, email: values.email.trim().toLowerCase() };
      const res = await axiosClient.post("/auth/register", payload);
      const data = await res.data;

      toast.success(data.msg);
      localStorage.setItem("token", data.token);
      await fetchUserProfile();
      router.push("/profile"); // land on profile to complete details
      helpers.resetForm();
    } catch (e) {
      toast.error(e?.response?.data?.msg || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full xl:w-[60%] flex items-start border rounded-lg overflow-hidden">
        <div className="hidden lg:block bg-white w-1/2">
          <img
            src="https://bfsi.eletsonline.com/wp-content/uploads/2023/07/Yono-SBI.jpg"
            className="h-full w-full object-cover"
            alt="Banner"
          />
        </div>

        <div className="w-full lg:w-1/2 px-8 py-10 bg-white">
          <h1 className="text-2xl font-semibold mb-6">Create your account</h1>
          <Formik initialValues={initialValues} validationSchema={schema} onSubmit={onSubmit}>
            {({ values }) => (
              <Form>
                <div className="mb-4">
                  <Field
                    type="text"
                    name="name"
                    className="w-full py-3 px-3 rounded border outline-none"
                    placeholder="Full name"
                    autoComplete="name"
                  />
                  <ErrorMessage name="name" className="text-red-500 text-sm" component="p" />
                </div>

                <div className="mb-4">
                  <Field
                    type="email"
                    name="email"
                    className="w-full py-3 px-3 rounded border outline-none"
                    placeholder="Email address"
                    autoComplete="email"
                  />
                  <ErrorMessage name="email" className="text-red-500 text-sm" component="p" />
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Field
                      type={showPwd ? "text" : "password"}
                      name="password"
                      className="w-full py-3 px-3 rounded border outline-none pr-10"
                      placeholder="Password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <ErrorMessage name="password" className="text-red-500 text-sm" component="p" />
                </div>

                <div className="mb-5">
                  <Field as="select" name="ac_type" className="w-full py-3 px-3 rounded border outline-none">
                    <option value="">Select Account Type</option>
                    <option value="saving">Saving</option>
                    <option value="current">Current</option>
                  </Field>
                  <ErrorMessage name="ac_type" className="text-red-500 text-sm" component="p" />
                </div>

                <CustomAuthButton isLoading={loading} text="Register" type="submit" className="cursor-pointer" />

                <p className="mt-4 text-end text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-rose-700 hover:underline ">
                    Login
                  </Link>
                </p>
              </Form>
            )}
          </Formik>

          {/* Silent hint */}
          <p className="mt-4 text-xs text-gray-500">
            By creating an account, you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
