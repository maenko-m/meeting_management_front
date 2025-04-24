import React, { useState, useEffect } from 'react';
import { Box, ThemeProvider, TextField, Button, Checkbox, FormControlLabel, Select, MenuItem, Typography, TableContainer, Table, TableHead, TableRow, TableCell, Paper, IconButton, Menu, Collapse, TableBody, SelectChangeEvent, useMediaQuery } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

import theme from '../../styles/theme';
import { fetchOffices } from "../../api/offices";
import { Employee, Office } from "../../types";
import { useAuth } from '../../context/AuthContext';
import { UpdateEmployeeData, updateEmployee } from '../../api/employees';
import { useRouter } from 'next/router';
import { useNotification } from '../../context/NotificationContext';
import { registerServiceWorker, removeSubscriptionFromServer, sendSubscriptionToServer, subscribeToPush } from '../../lib/push';

const VAPID_PUBLIC_KEY = 'BBceryB_Lo_6FOu8_jstUK5ExGze1esePCV8P8NwRbSCkOMeIm9xn23_7dTWM14M6YQx2VPEVX8yqcqtgezRppc';

const ProfilePage = () => {

  const isLaptop = useMediaQuery("(max-width:1440px)");
  const isTablet = useMediaQuery("(max-width:1024px)");
  const isMobile = useMediaQuery("(max-width:600px)");

    const router = useRouter();
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        patronymic: "",
        email: "",
        password: "",
        officeId: null as number | null,
        emailNotifications: true,
        webPush: localStorage.getItem('pushEnabled') ? Boolean(localStorage.getItem('pushEnabled')) : false,
    });

    const [offices, setOffices] = useState<Office[]>([]);
    const [defaultOfficeId, setDefaultOfficeId] = useState<number | null>(null);

    const { user, loading, updateUser, hasRole } = useAuth();
    const { showNotification } = useNotification()

    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
        setIsEdited(true);
    };
      
    const handleWebPushCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setProfile((prev) => ({ ...prev, [name]: checked }));

        localStorage.setItem('pushEnabled', JSON.stringify(e.target.checked));

        if (e.target.checked) {
          try {
            const registration = await registerServiceWorker();
            const subscription = await subscribeToPush(registration, VAPID_PUBLIC_KEY);
            await sendSubscriptionToServer(subscription, user!.id);
          } catch (err) {
            console.error('Push subscription failed:', err);
          }
        } else {
          // Отключение пушей
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe(); 
            await removeSubscriptionFromServer(subscription); 
          }
        }
    };
  
      
    const handleOfficeChange = (e: SelectChangeEvent<string | number>) => {
        const value = e.target.value === 'none' ? null : Number(e.target.value);
        setProfile((prev) => ({ ...prev, officeId: value }));
        setDefaultOfficeId(value);
        if (value === null) {
          localStorage.removeItem('default_office_id');
        } else {
          localStorage.setItem('default_office_id', value.toString());
        }
      };

    const handleSave = async () => {
        if (!user) return;
      
        setSaveLoading(true);
        setSaveError(null);
      
        try {
          const updateData: UpdateEmployeeData = {
            name: profile.firstName || null,
            surname: profile.lastName || null,
            patronymic: profile.patronymic || null,
            email: profile.email || null,
            password: isEditingPassword && profile.password ? profile.password : null, 
          };
      
          await updateEmployee(user.id, updateData);

          updateUser({
            name: profile.firstName,
            surname: profile.lastName,
            patronymic: profile.patronymic,
            email: profile.email,
          });

          setIsEdited(false);
          setIsEditingPassword(false);
        } catch (err) {
          showNotification(
            "Не удалось сохранить изменения",
            'error'
          );
          setSaveError('Не удалось сохранить изменения');
        } finally {
          setSaveLoading(false);
        }
    };
      
    const handleCancel = () => {
        if (user) {
          setProfile({
            firstName: user.name || "",
            lastName: user.surname || "",
            patronymic: user.patronymic || "",
            email: user.email || "",
            password: "",
            officeId: defaultOfficeId,
            emailNotifications: true,
            webPush: true,
          });
          setIsEdited(false);
          setIsEditingPassword(false);
        }
    };


    useEffect(() => {
        const loadOffices = async () => {
          try {
            const data = await fetchOffices();
            setOffices(data);

            const storedOfficeId = localStorage.getItem('default_office_id');
            setDefaultOfficeId(storedOfficeId ? Number(storedOfficeId) : null);
          } catch (err) {
            showNotification(
              "Не удалось загрузить офисы",
              'error'
            );
          }
        };
        loadOffices();
    }, []);

    useEffect(() => {
        if (user) {
          setProfile({
            firstName: user.name || "",
            lastName: user.surname || "",
            patronymic: user.patronymic || "",
            email: user.email || "",
            password: "",
            officeId: defaultOfficeId,
            emailNotifications: true,
            webPush: true, 
          });
        }
      }, [user, defaultOfficeId]);

    return (
        <ThemeProvider theme={theme}>
            <div style={{ width: "100%"}}>

                {/* Заголовок */}
                <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "1em", alignItems: isMobile ? "flex-end" : "center", flexDirection: isMobile ? "column" : "row", gap: 1 }}>
                    <Typography variant="h5" sx={{ padding: "12px 0" }} >Профиль</Typography>
                    <Box sx={{ display:"flex", gap: 2 }}>
                        {(!loading && hasRole("ROLE_USER")) && (
                          <Button sx={{ color: "secondary.main", background: "#EEEEEE" }} onClick={() => router.push('/archive')}>
                              Архив мероприятий
                          </Button>)}
                    </Box>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: isMobile ? "79vh" : "83vh" }}>
                  <Box>
                    <Box sx={{ borderBottom: "1px solid #A3A3A3", marginBottom: "20px" }}>
                      {loading ? (
                          <Typography variant="h5">Загрузка...</Typography>
                      ) : (
                          <Box sx={{ width: isTablet ? "100%" : "620px", display: "flex", gap: "20px", marginBottom: "20px", flexDirection: isMobile ? "column" : "row" }}>
                              <Box sx={{ width: isMobile ? "100%" : "50%", display: "flex", flexDirection: "column", gap: 2 }}>
                                <TextField label="Имя" name="firstName" fullWidth value={profile.firstName} onChange={handleChange} />
                                <TextField label="Фамилия" name="lastName" fullWidth value={profile.lastName} onChange={handleChange} />
                                <TextField label="Отчество" name="patronymic" fullWidth value={profile.patronymic} onChange={handleChange} />
                            </Box>
                            <Box sx={{ width: isMobile ? "100%" : "50%", display: "flex", flexDirection: "column", gap: 2 }}>
                                <TextField label="Email" name="email" fullWidth value={profile.email} onChange={handleChange} />
                                {isEditingPassword ? (
                                    <TextField label="Новый пароль" name="password" fullWidth value={profile.password} onChange={handleChange} />
                                ) : (
                                    <Button variant="outlined" color="secondary" fullWidth
                                            onClick={() => setIsEditingPassword(true)} >
                                        <img src="/images/edit-icon.svg" alt="icon" style={{ marginRight: 5 }} />
                                        Изменить пароль
                                    </Button>
                                )}
                            </Box>
                          </Box>  
                      )}
                    </Box>
                
                    {/* Офис и другие изменения */}
                    <Box sx={{ width: isTablet ? "100%" : "620px", display: "flex", flexDirection: "column" }}>
                        <Typography variant="subtitle1" gutterBottom>Офис по умолчанию</Typography>
                        <Select name="office"
                                fullWidth
                                sx={{ width: isTablet ? isMobile ? "100%" : "calc(50% - 10px)" : "300px", marginRight: "20px" }}
                                value={profile.officeId ?? 'none'}
                                onChange={handleOfficeChange}>
                            <MenuItem value="none">Нет офиса по умолчанию</MenuItem>
                            {offices.map((office) => {
                                return <MenuItem key={office.id} value={office.id}>{office.name}</MenuItem>
                            })}
                        </Select>
                        <FormControlLabel 
                            control={<Checkbox checked={profile.webPush} onChange={handleWebPushCheckboxChange} name="webPush" />}
                            label="Web-пуши о мероприятиях" />
                    </Box>
                  </Box>
                  {/* Кнопки */}
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                      <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={saveLoading} sx={{ width: isMobile ? "100%" : "auto" }}>
                          <img width="18" height="18" src="/images/cancel-icon.svg" alt="icon" style={{ marginRight: 10 }} />
                          Отменить
                      </Button>
                      <Button variant={isEdited ? "contained" : "outlined"}
                              color={isEdited ? "primary" : "secondary"}
                              onClick={handleSave}
                              disabled={saveLoading || !isEdited} sx={{ width: isMobile ? "100%" : "auto" }}>
                          <svg width="16" height="16" viewBox="0 0 19 19" fill="currentColor" style={{ marginRight: 10 }}>
                              <path d="M18 4.5V16.5C18 17.05 17.8042 17.5208 17.4125 17.9125C17.0208 18.3042 16.55 18.5 16 18.5H2C1.45 18.5 0.979167 18.3042 0.5875 17.9125C0.195833 17.5208 0 17.05 0 16.5V2.5C0 1.95 0.195833 1.47917 0.5875 1.0875C0.979167 0.695833 1.45 0.5 2 0.5H14L18 4.5ZM16 5.35L13.15 2.5H2V16.5H16V5.35ZM9 15.5C9.83333 15.5 10.5417 15.2083 11.125 14.625C11.7083 14.0417 12 13.3333 12 12.5C12 11.6667 11.7083 10.9583 11.125 10.375C10.5417 9.79167 9.83333 9.5 9 9.5C8.16667 9.5 7.45833 9.79167 6.875 10.375C6.29167 10.9583 6 11.6667 6 12.5C6 13.3333 6.29167 14.0417 6.875 14.625C7.45833 15.2083 8.16667 15.5 9 15.5ZM3 7.5H12V4.5H3V7.5ZM2 5.35V16.5V2.5V5.35Z"/>
                          </svg>
                          {saveLoading ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                  </Box>
                </Box>
            </div>
        </ThemeProvider>
    );
};

export default ProfilePage;  