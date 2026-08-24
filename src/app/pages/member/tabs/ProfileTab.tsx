import { useState } from "react";
import { Form, Formik } from "formik";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import WorkIcon from "@mui/icons-material/Work";
import EventIcon from "@mui/icons-material/Event";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import type { Contribution, Gender, Member, NextOfKin, NextOfKinInput } from "@/redux";
import {
  useAppDispatch,
  useAppSelector,
  updateProfile,
  addNextOfKin,
  updateNextOfKin,
  removeNextOfKin,
} from "@/redux";
import { DetailField } from "@/app/components/DetailField";
import { fmtDate, fmtUGX } from "@/app/utils/format";
import { nextOfKinSchema, profileSchema } from "@/app/validation/schemas";
import { AppDatePicker } from "@/app/components/AppDatePicker";

const emptyNok: NextOfKinInput = {
  name: "",
  telephone: "",
  email: "",
  relationship: "Spouse",
};

export function ProfileTab({
  user,
  contributions,
}: {
  user: Member;
  contributions: Contribution[];
}) {
  const dispatch = useAppDispatch();
  const relationships = useAppSelector(s => s.auth.relationships);

  const myContribs = contributions.filter(c => c.memberId === user.id && c.status === "approved");
  const myFines = myContribs.filter(c => c.hasFine && !c.finePaid);
  const totalPaid = myContribs.reduce((s, c) => s + c.amount, 0);
  const nextOfKins = user.nextOfKins ?? [];

  const [editing, setEditing] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileOk, setProfileOk] = useState("");

  const [nokOpen, setNokOpen] = useState(false);
  const [editingNok, setEditingNok] = useState<NextOfKin | null>(null);
  const [nokError, setNokError] = useState("");

  const openEditProfile = () => {
    setProfileError("");
    setProfileOk("");
    setEditing(true);
  };

  const openAddNok = () => {
    setEditingNok(null);
    setNokError("");
    setNokOpen(true);
  };

  const openEditNok = (nok: NextOfKin) => {
    setEditingNok(nok);
    setNokError("");
    setNokOpen(true);
  };

  const nokInitialValues: NextOfKinInput = editingNok
    ? {
        name: editingNok.name,
        telephone: editingNok.telephone,
        email: editingNok.email,
        relationship: editingNok.relationship,
      }
    : { ...emptyNok, relationship: relationships[0] || "Spouse" };

  const deleteNok = async (id: string) => {
    if (!window.confirm("Remove this next of kin?")) return;
    await dispatch(removeNextOfKin(id));
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ bgcolor: "primary.main", color: "common.white", p: { xs: 3, sm: 4 } }}>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "secondary.main",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: "secondary.main", letterSpacing: "0.2em", fontWeight: 700 }}>
              {user.isAdmin ? "ADMINISTRATOR · MEMBER" : "VERIFIED MEMBER"}
            </Typography>
            <Typography variant="h4" color="inherit">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)" }}>{user.occupation}</Typography>
          </Box>
          {!editing && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={openEditProfile}
              sx={{
                color: "common.white",
                borderColor: "rgba(255,255,255,0.4)",
                "&:hover": { borderColor: "secondary.main", bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              Edit
            </Button>
          )}
        </Stack>

        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
              TOTAL PAID
            </Typography>
            <Typography sx={{ color: "secondary.main", fontWeight: 800, fontSize: 18 }}>
              {fmtUGX(totalPaid)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
              MONTHS PAID
            </Typography>
            <Typography fontWeight={800} fontSize={18}>
              {myContribs.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
              FINES OWED
            </Typography>
            <Typography fontWeight={800} fontSize={18} sx={{ color: myFines.length ? "#fcd34d" : "inherit" }}>
              {myFines.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {profileOk && <Alert severity="success">{profileOk}</Alert>}

      {editing ? (
        <Formik
          enableReinitialize
          initialValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            occupation: user.occupation,
            dateOfBirth: user.dateOfBirth,
            tel: user.tel,
            address: user.address,
            gender: user.gender,
            email: user.email,
          }}
          validationSchema={profileSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setProfileError("");
            setProfileOk("");
            const result = await dispatch(updateProfile(values));
            setSubmitting(false);
            if (updateProfile.fulfilled.match(result)) {
              setProfileOk("Profile updated successfully.");
              setEditing(false);
            } else {
              setProfileError((result.payload as string) || "Could not update profile.");
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
            <Paper sx={{ p: 3 }} component={Form}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.12em">
                EDIT PROFILE
              </Typography>
              {profileError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {profileError}
                </Alert>
              )}
              <Box
                sx={{
                  mt: 2.5,
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <TextField
                  name="firstName"
                  label="First name"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                />
                <TextField
                  name="lastName"
                  label="Last name"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                />
                <TextField
                  name="occupation"
                  label="Occupation"
                  value={values.occupation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.occupation && Boolean(errors.occupation)}
                  helperText={touched.occupation && errors.occupation}
                />
                <AppDatePicker
                  name="dateOfBirth"
                  label="Date of birth"
                  value={values.dateOfBirth}
                  onChange={iso => setFieldValue("dateOfBirth", iso)}
                  onBlur={handleBlur}
                  error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                  helperText={touched.dateOfBirth && errors.dateOfBirth}
                  disableFuture
                />
                <TextField
                  name="tel"
                  label="Telephone"
                  value={values.tel}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.tel && Boolean(errors.tel)}
                  helperText={touched.tel && errors.tel}
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                <TextField
                  name="address"
                  label="Residential address"
                  sx={{ gridColumn: { sm: "1 / -1" } }}
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                />
                <FormControl>
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={values.gender}
                    onChange={e => setFieldValue("gender", e.target.value as Gender)}
                  >
                    <FormControlLabel value="Male" control={<Radio />} label="Male" />
                    <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button onClick={() => setEditing(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save profile"}
                </Button>
              </Stack>
            </Paper>
          )}
        </Formik>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.12em">
            PERSONAL DETAILS
          </Typography>
          <Box
            sx={{
              mt: 2.5,
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <DetailField icon={<EmailIcon fontSize="inherit" color="secondary" />} label="Email" value={user.email} />
            <DetailField icon={<PhoneIcon fontSize="inherit" color="secondary" />} label="Tel. Contact" value={user.tel} />
            <DetailField icon={<CakeIcon fontSize="inherit" color="secondary" />} label="Date of Birth" value={fmtDate(user.dateOfBirth)} />
            <DetailField icon={<WcIcon fontSize="inherit" color="secondary" />} label="Gender" value={user.gender} />
            <DetailField icon={<WorkIcon fontSize="inherit" color="secondary" />} label="Occupation" value={user.occupation} />
            <DetailField icon={<EventIcon fontSize="inherit" color="secondary" />} label="Member Since" value={fmtDate(user.joinedAt)} />
            <DetailField icon={<HomeIcon fontSize="inherit" color="secondary" />} label="Residential Address" value={user.address} />
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.12em">
              NEXT OF KIN
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              People we can contact in case of emergency.
            </Typography>
          </Box>
          <Button variant="contained" color="secondary" startIcon={<PersonAddAltIcon />} onClick={openAddNok}>
            Add
          </Button>
        </Stack>

        {nextOfKins.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2.5 }}>
            No next of kin added yet. Add at least one contact.
          </Alert>
        ) : (
          <Stack spacing={1.5} sx={{ mt: 2.5 }}>
            {nextOfKins.map(nok => (
              <Box
                key={nok.id}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography fontWeight={700}>
                    {nok.name}{" "}
                    <Typography component="span" variant="body2" color="secondary.main" fontWeight={700}>
                      · {nok.relationship}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {nok.telephone} · {nok.email}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" aria-label="Edit next of kin" onClick={() => openEditNok(nok)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" aria-label="Remove next of kin" color="error" onClick={() => deleteNok(nok.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog open={nokOpen} onClose={() => setNokOpen(false)} fullWidth maxWidth="sm">
        <Formik
          enableReinitialize
          initialValues={nokInitialValues}
          validationSchema={nextOfKinSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setNokError("");
            const result = editingNok
              ? await dispatch(updateNextOfKin({ id: editingNok.id, ...values }))
              : await dispatch(addNextOfKin(values));
            setSubmitting(false);
            if (
              (editingNok && updateNextOfKin.fulfilled.match(result)) ||
              (!editingNok && addNextOfKin.fulfilled.match(result))
            ) {
              setNokOpen(false);
            } else {
              setNokError((result.payload as string) || "Could not save next of kin.");
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
            <Form>
              <DialogTitle>{editingNok ? "Edit next of kin" : "Add next of kin"}</DialogTitle>
              <DialogContent>
                {nokError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {nokError}
                  </Alert>
                )}
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <TextField
                    name="name"
                    label="Full name"
                    fullWidth
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <TextField
                    name="telephone"
                    label="Telephone"
                    fullWidth
                    value={values.telephone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.telephone && Boolean(errors.telephone)}
                    helperText={touched.telephone && errors.telephone}
                  />
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <FormControl fullWidth error={touched.relationship && Boolean(errors.relationship)}>
                    <InputLabel id="relationship-label">Relationship</InputLabel>
                    <Select
                      labelId="relationship-label"
                      label="Relationship"
                      name="relationship"
                      value={values.relationship}
                      onChange={e => setFieldValue("relationship", e.target.value)}
                      onBlur={handleBlur}
                    >
                      {relationships.map(r => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setNokOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="secondary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : editingNok ? "Save changes" : "Add next of kin"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Stack>
  );
}
