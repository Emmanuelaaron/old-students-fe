import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import { AppHeader } from "@/app/layout/AppHeader";
import { LandingPage } from "@/app/pages/landing/LandingPage";
import { LoginPage } from "@/app/pages/login/LoginPage";
import { SignupPage } from "@/app/pages/signup/SignupPage";
import { PendingPage } from "@/app/pages/pending/PendingPage";
import { AdminDashboardPage } from "@/app/pages/admin/AdminDashboardPage";
import { MemberDashboardPage } from "@/app/pages/member/MemberDashboardPage";
import {
  approveContributionReport,
  approveMember,
  bootstrapApp,
  loadDashboardData,
  logout as logoutAction,
  markFinePaid,
  recordContribution as recordContributionAction,
  register as registerAction,
  rejectContributionReport,
  rejectMember,
  reportContribution as reportContributionAction,
  requestOtp as requestOtpAction,
  selectApprovedCount,
  selectApprovedMembers,
  selectAuthStatus,
  selectContributions,
  selectCurrentUser,
  selectFineAmount,
  selectMembers,
  selectMonthlyContribution,
  selectPendingMembers,
  selectPendingReports,
  selectUnpaidFines,
  useAppDispatch,
  useAppSelector,
  verifyOtp as verifyOtpAction,
  type Member,
  type RegisterInput,
} from "@/redux";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const members = useAppSelector(selectMembers);
  const contributions = useAppSelector(selectContributions);
  const user = useAppSelector(selectCurrentUser);
  const authStatus = useAppSelector(selectAuthStatus);
  const pending = useAppSelector(selectPendingMembers);
  const approved = useAppSelector(selectApprovedMembers);
  const unpaidFines = useAppSelector(selectUnpaidFines);
  const pendingReports = useAppSelector(selectPendingReports);
  const approvedCount = useAppSelector(selectApprovedCount);
  const monthlyContribution = useAppSelector(selectMonthlyContribution);
  const fineAmount = useAppSelector(selectFineAmount);

  useEffect(() => {
    dispatch(bootstrapApp());
  }, [dispatch]);

  const homeFor = (m: Member) => {
    if (m.role !== "member") return "/admin";
    if (m.approved) return "/dashboard/overview";
    return "/pending";
  };

  const requestOtp = async (identifier: string) => {
    const result = await dispatch(requestOtpAction(identifier));
    if (requestOtpAction.rejected.match(result)) {
      return { error: (result.payload as string) || "Could not send login code." };
    }
    const payload = result.payload as { emailHint?: string; emailHint?: string };
    return { emailHint: payload.emailHint || payload.emailHint };
  };

  const verifyOtp = async (identifier: string, code: string): Promise<string | null> => {
    const result = await dispatch(verifyOtpAction({ identifier, code }));
    if (verifyOtpAction.rejected.match(result)) {
      return (result.payload as string) || "Invalid or expired code.";
    }
    await dispatch(loadDashboardData());
    navigate(homeFor(result.payload.member));
    return null;
  };

  const logout = async () => {
    await dispatch(logoutAction());
    navigate("/");
  };

  const register = async (data: RegisterInput): Promise<string | null> => {
    const result = await dispatch(registerAction(data));
    if (registerAction.rejected.match(result)) {
      return (result.payload as string) || "Registration failed.";
    }
    navigate("/pending");
    return null;
  };

  const recordContribution = async (
    memberId: string,
    month: string,
    paidAt: string
  ): Promise<string | null> => {
    const result = await dispatch(recordContributionAction({ memberId, month, paidAt }));
    if (recordContributionAction.rejected.match(result)) {
      return (result.payload as string) || "Could not record contribution.";
    }
    await dispatch(loadDashboardData());
    return null;
  };

  const reportContribution = async (
    months: string[],
    paidAt: string,
    proof: File
  ): Promise<string | null> => {
    const result = await dispatch(reportContributionAction({ months, paidAt, proof }));
    if (reportContributionAction.rejected.match(result)) {
      return (result.payload as string) || "Could not submit contribution report.";
    }
    await dispatch(loadDashboardData());
    return null;
  };

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const showHeader = location.pathname !== "/";

  const requireUser = (element: React.ReactNode) =>
    user ? element : <Navigate to="/login" replace />;

  const requireAdmin = (element: React.ReactNode) => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "member") return <Navigate to={homeFor(user)} replace />;
    return element;
  };

  const requireMember = (element: React.ReactNode) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!user.approved && !user.isAdmin) return <Navigate to="/pending" replace />;
    return element;
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {showHeader && <AppHeader user={user} onLogout={() => void logout()} />}

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              approvedCount={approvedCount || approved.length}
              monthlyContribution={monthlyContribution}
              fineAmount={fineAmount}
              onLogin={() => navigate("/login")}
              onRegister={() => navigate("/signup")}
            />
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={homeFor(user)} replace />
            ) : (
              <LoginPage
                onRequestOtp={requestOtp}
                onVerifyOtp={verifyOtp}
                onGoRegister={() => navigate("/signup")}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to={homeFor(user)} replace />
            ) : (
              <SignupPage onRegister={register} onGoLogin={() => navigate("/login")} />
            )
          }
        />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route
          path="/pending"
          element={requireUser(
            user && !user.approved && !user.isAdmin ? (
              <PendingPage user={user} onLogout={() => void logout()} />
            ) : (
              <Navigate to={user ? homeFor(user) : "/login"} replace />
            )
          )}
        />
        <Route
          path="/admin"
          element={requireAdmin(
            user && (
              <AdminDashboardPage
                members={members}
                contributions={contributions}
                pending={pending}
                approved={approved}
                unpaidFines={unpaidFines}
                pendingReports={pendingReports}
                onApprove={async id => {
                  await dispatch(approveMember(id));
                  await dispatch(loadDashboardData());
                }}
                onReject={async id => {
                  await dispatch(rejectMember(id));
                  await dispatch(loadDashboardData());
                }}
                onRecordContribution={recordContribution}
                onMarkFinePaid={async id => {
                  await dispatch(markFinePaid(id));
                  await dispatch(loadDashboardData());
                }}
                onApproveReport={async id => {
                  await dispatch(approveContributionReport(id));
                  await dispatch(loadDashboardData());
                }}
                onRejectReport={async id => {
                  await dispatch(rejectContributionReport(id));
                  await dispatch(loadDashboardData());
                }}
                user={user}
              />
            )
          )}
        />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
        <Route
          path="/dashboard/:tab"
          element={requireMember(
            user && (
              <MemberDashboardPage
                user={user}
                contributions={contributions}
                onReportContribution={reportContribution}
              />
            )
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}
