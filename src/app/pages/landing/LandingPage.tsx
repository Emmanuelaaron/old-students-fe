import { Box, Button, Stack, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImage from "@/imports/image.png";
import { fmtUGX } from "@/app/utils/format";

const serif = { fontFamily: "'Cinzel', Georgia, serif" };

export function LandingPage({
  approvedCount,
  monthlyContribution,
  onLogin,
  onRegister,
}: {
  approvedCount: number;
  monthlyContribution: number;
  fineAmount: number;
  onLogin: () => void;
  onRegister: () => void;
}) {
  const stats = [
    { label: "Active Members", value: String(approvedCount), icon: <GroupsIcon sx={{ fontSize: 15 }} /> },
    {
      label: "Monthly Contribution",
      value: fmtUGX(monthlyContribution),
      icon: <PaymentsIcon sx={{ fontSize: 15 }} />,
    },
    { label: "Late Payment Fine", value: "10%", icon: <WarningAmberIcon sx={{ fontSize: 15 }} /> },
  ];

  return (
    <Box
      data-landing="true"
      sx={{
        flex: 1,
        minHeight: "100dvh",
        width: "100%",
        bgcolor: "#1b2d5e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: { xs: 1.5, sm: 2 },
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "repeating-linear-gradient(135deg, #c8991a 0, #c8991a 1px, transparent 0, transparent 32px)",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 520,
          width: "100%",
          mx: "auto",
          textAlign: "center",
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            width: { xs: 96, sm: 112 },
            height: { xs: 96, sm: 112 },
            borderRadius: "50%",
            bgcolor: "common.white",
            p: 1.25,
            mb: { xs: 1.5, sm: 2 },
            boxShadow: 6,
            outline: "3px solid #c8991a",
            outlineOffset: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageWithFallback
              src={logoImage}
              alt="HCLV OSA Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                borderRadius: "50%",
              }}
            />
          </Box>
        </Box>

        <Typography
          sx={{
            ...serif,
            color: "#c8991a",
            fontSize: { xs: 10, sm: 12 },
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontWeight: 600,
            mb: 0.75,
          }}
        >
          Class of 2005 – 2008
        </Typography>

        <Typography
          sx={{
            ...serif,
            color: "common.white",
            fontSize: { xs: "1.35rem", sm: "1.75rem" },
            fontWeight: 700,
            lineHeight: 1.15,
            mb: 0.25,
          }}
        >
          Holy Cross Lake View
        </Typography>

        <Typography
          sx={{
            ...serif,
            color: "rgba(255,255,255,0.8)",
            fontSize: { xs: "0.95rem", sm: "1.15rem" },
            fontWeight: 600,
            lineHeight: 1.2,
            mb: 0.25,
          }}
        >
          Senior Secondary School
        </Typography>

        <Typography
          sx={{
            ...serif,
            color: "#c8991a",
            fontSize: { xs: "0.85rem", sm: "0.95rem" },
            fontWeight: 600,
            mb: 1.25,
          }}
        >
          Old Students&apos; Association
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.5)",
            fontSize: { xs: 12, sm: 13 },
            maxWidth: 360,
            lineHeight: 1.45,
            mb: { xs: 2, sm: 2.5 },
          }}
        >
          Uniting former students of Holy Cross Lake View SSS. Stay connected, contribute monthly, and
          grow together.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
          alignItems="stretch"
          sx={{ width: "100%", maxWidth: 400 }}
        >
          <Button
            onClick={onLogin}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: "#c8991a",
              color: "common.white",
              fontWeight: 700,
              px: 2.5,
              py: 0,
              height: 44,
              borderRadius: 3,
              fontSize: 13,
              letterSpacing: "0.04em",
              boxShadow: 3,
              flex: { sm: 1 },
              whiteSpace: "nowrap",
              border: "1px solid transparent",
              boxSizing: "border-box",
              "&:hover": { bgcolor: "#a07815" },
            }}
          >
            Member Login
          </Button>
          <Button
            onClick={onRegister}
            variant="outlined"
            fullWidth
            sx={{
              color: "common.white",
              borderColor: "rgba(255,255,255,0.25)",
              bgcolor: "rgba(255,255,255,0.1)",
              fontWeight: 600,
              px: 2.5,
              py: 0,
              height: 44,
              borderRadius: 3,
              fontSize: 13,
              letterSpacing: "0.04em",
              flex: { sm: 1 },
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.18)",
                borderColor: "rgba(255,255,255,0.35)",
              },
            }}
          >
            Register as Member
          </Button>
        </Stack>

        <Stack
          direction="row"
          flexWrap="nowrap"
          justifyContent="center"
          useFlexGap
          sx={{ mt: { xs: 2.5, sm: 3.5 }, gap: { xs: 2.5, sm: 4 } }}
        >
          {stats.map(s => (
            <Stack key={s.label} alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.1)",
                  display: "grid",
                  placeItems: "center",
                  color: "#c8991a",
                }}
              >
                {s.icon}
              </Box>
              <Typography sx={{ color: "common.white", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                {s.value}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {s.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
