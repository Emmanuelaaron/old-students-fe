import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import type { Member } from "@/redux";
import { LogoMark } from "@/app/components/LogoMark";

export function AppHeader({
  user,
  onLogout,
}: {
  user: Member | null;
  onLogout: () => void;
}) {
  return (
    <AppBar position="sticky" elevation={2} sx={{ bgcolor: "primary.main" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1, gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <LogoMark size={44} />
            <Box sx={{ display: { xs: "none", sm: "block" }, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "secondary.main",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontFamily: "'Cinzel', serif",
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                Holy Cross Lake View S.S.S.
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em" }}>
                OLD STUDENTS&apos; ASSOCIATION · CLASS OF 2005–2008
              </Typography>
            </Box>
          </Stack>

          {user && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
                <Typography variant="body2" fontWeight={700} color="common.white">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: "secondary.main", fontWeight: 600 }}>
                  {user.isChairperson
                    ? "Chairperson"
                    : user.role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </Typography>
              </Box>
              <Button
                color="inherit"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={onLogout}
                sx={{
                  border: "1px solid rgba(255,255,255,0.2)",
                  bgcolor: "rgba(255,255,255,0.08)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Logout
                </Box>
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
