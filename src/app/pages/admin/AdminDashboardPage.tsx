import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Badge, Box, Button, Container, Stack, Tab, Tabs } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HistoryIcon from "@mui/icons-material/History";
import type { Contribution, Member } from "@/redux";
import { OverviewTab } from "./tabs/OverviewTab";
import { ApprovalsTab } from "./tabs/ApprovalsTab";
import { MembersTab } from "./tabs/MembersTab";
import { ContributionsTab } from "./tabs/ContributionsTab";
import { PaymentReportsTab } from "./tabs/PaymentReportsTab";
import { FinesTab } from "./tabs/FinesTab";
import { RoleHistoryTab } from "./tabs/RoleHistoryTab";
import { RecordContributionDialog } from "./RecordContributionDialog";

type AdminTab =
  | "overview"
  | "approvals"
  | "members"
  | "contributions"
  | "reports"
  | "fines"
  | "history";

const TAB_PERMISSIONS: Record<AdminTab, MemberRole[]> = {
  overview: ["chairperson", "vice_chairperson", "secretary", "vice_secretary", "treasurer", "vice_treasurer"],
  approvals: ["chairperson"],
  members: ["chairperson"],
  contributions: ["chairperson", "treasurer", "vice_treasurer"],
  reports: ["chairperson", "treasurer", "vice_treasurer"],
  fines: ["chairperson", "treasurer", "vice_treasurer"],
  history: ["chairperson"],
};

export function AdminDashboardPage({
  user,
  members,
  contributions,
  pending,
  approved,
  unpaidFines,
  pendingReports,
  onApprove,
  onReject,
  onRecordContribution,
  onMarkFinePaid,
  onApproveReport,
  onRejectReport,
}: {
  user: Member;
  members: Member[];
  contributions: Contribution[];
  pending: Member[];
  approved: Member[];
  unpaidFines: Contribution[];
  pendingReports: Contribution[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onRecordContribution: (memberId: string, month: string, paidAt: string) => Promise<string | null>;
  onMarkFinePaid: (id: string) => Promise<void>;
  onApproveReport: (id: string) => Promise<void>;
  onRejectReport: (id: string) => Promise<void>;
}) {
  const allTabs: { key: AdminTab; label: string; icon: React.ReactElement; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: <HomeIcon fontSize="small" /> },
    {
      key: "approvals",
      label: "Approvals",
      icon: <HowToRegIcon fontSize="small" />,
      badge: pending.length || undefined,
    },
    { key: "members", label: "Directory", icon: <GroupsIcon fontSize="small" /> },
    { key: "contributions", label: "Contributions", icon: <PaymentsIcon fontSize="small" /> },
    {
      key: "reports",
      label: "Payment Reports",
      icon: <ReceiptLongIcon fontSize="small" />,
      badge: pendingReports.length || undefined,
    },
    {
      key: "fines",
      label: "Fines",
      icon: <WarningAmberIcon fontSize="small" />,
      badge: unpaidFines.length || undefined,
    },
    {
      key: "history",
      label: "Role History",
      icon: <HistoryIcon fontSize="small" />,
    },
  ];

  const tabs = allTabs.filter(t => TAB_PERMISSIONS[t.key].includes(user.role));
  const [tab, setTab] = useState<AdminTab>(tabs[0]?.key || "overview");
  const [recordOpen, setRecordOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const approvedContributions = contributions.filter(c => c.status === "approved");
  const navigate = useNavigate();

  const wrapWithLoader = (fn: (id: string) => Promise<void>) => async (id: string) => {
    setLoadingId(id);
    try {
      await fn(id);
    } finally {
      setLoadingId(null);
    }
  };

  const handleApprove = wrapWithLoader(onApprove);
  const handleReject = wrapWithLoader(onReject);
  const handleMarkFinePaid = wrapWithLoader(onMarkFinePaid);
  const handleApproveReport = wrapWithLoader(onApproveReport);
  const handleRejectReport = wrapWithLoader(onRejectReport);

  useEffect(() => {
    if (!tabs.find(t => t.key === tab)) {
      setTab(tabs[0]?.key || "overview");
    }
  }, [tab, tabs]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 64,
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Tabs
                value={tab}
                onChange={(_, v: AdminTab) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                textColor="secondary"
                indicatorColor="secondary"
                sx={{
                  overflow: "visible",
                  "& .MuiTabs-scroller": { overflow: "visible" },
                }}
              >
                {tabs.map(t => (
                  <Tab
                    key={t.key}
                    value={t.key}
                    icon={t.icon}
                    iconPosition="start"
                    sx={{ overflow: "visible", minHeight: 48, px: 2 }}
                    label={
                      t.badge ? (
                        <Badge
                          color="error"
                          badgeContent={t.badge}
                          max={999}
                          sx={{
                            "& .MuiBadge-badge": {
                              position: "relative",
                              transform: "none",
                              ml: 1,
                              top: "auto",
                              right: "auto",
                            },
                          }}
                        >
                          {t.label}
                        </Badge>
                      ) : (
                        t.label
                      )
                    }
                  />
                ))}
              </Tabs>
            </Box>
            {user.role !== "member" && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => navigate("/dashboard/overview")}
              >
                My Member View
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {tab === "overview" && <OverviewTab />}
        {tab === "approvals" && (
          <ApprovalsTab pending={pending} onApprove={handleApprove} onReject={handleReject} loadingId={loadingId} />
        )}
        {tab === "members" && <MembersTab approved={approved} />}
        {tab === "contributions" && (
          <ContributionsTab
            members={members}
            contributions={approvedContributions}
            onOpenRecord={() => setRecordOpen(true)}
          />
        )}
        {tab === "reports" && (
          <PaymentReportsTab
            members={members}
            pendingReports={pendingReports}
            onApprove={handleApproveReport}
            onReject={handleRejectReport}
            loadingId={loadingId}
          />
        )}
        {tab === "fines" && (
          <FinesTab
            members={members}
            unpaidFines={unpaidFines}
            onMarkFinePaid={handleMarkFinePaid}
            loadingId={loadingId}
          />
        )}
        {tab === "history" && <RoleHistoryTab />}
      </Container>

      <RecordContributionDialog
        open={recordOpen}
        approved={approved}
        onClose={() => setRecordOpen(false)}
        onSubmit={onRecordContribution}
      />
    </Box>
  );
}
