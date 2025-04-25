import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup"; 
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { Link } from "react-router-dom";
import { Box, Typography, useTheme, Button, Divider, IconButton} from "@mui/material";
import { tokens } from "../../themes";
import MuiCard from '@mui/material/Card';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import ForgotPassword from "../../components/ForgotPassword.tsx";
import { useState } from "react";
import axiosInstance from '../../services/httpService.js';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context.js";
import { toast } from "react-toastify";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const userSchema = yup.object({
    email: yup.string()
            .required("Email is required")
            .email("Invalid email format"),                               
    password: yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters")
                .matches(/(?=.*[0-9!@#$%^&*])/, "Password must contain a number or special character"),
});

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
      maxWidth: '450px',
    },
    boxShadow:
      'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
      boxShadow:
        'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(4),
    },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      zIndex: -1,
      inset: 0,
      backgroundImage:
        'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
      backgroundRepeat: 'no-repeat',
      ...theme.applyStyles('dark', {
        backgroundImage:
          'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
      }),
    },
}));

const Login = () => {
    const { login } = useAuth();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleClickOpen = () => {
        setOpen(true);
      };
    
      const handleClose = () => {
        setOpen(false);
      };

    const { register, handleSubmit, formState: {errors} } = useForm({
        resolver: yupResolver(userSchema)
    }); 

    const onSubmit = async (data) => { 
        try {
            const response = await axiosInstance.post('/auth/login', data);
            if (response.status_code === 200 || response.status_code === 201) {
                login(response.data.token, response.data.refresh_token);
                toast.success("Login success!");
                navigate("/");
            }
        }
        catch(error) { 
            console.log(error);
            toast.error("Login failed!, Please check your information again");
        }
    }
    
    return (
        <SignInContainer 
            direction="column" 
            justifyContent="space-between"
        >
            <Card variant="outlined">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Sign in
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 2,
                      }}
                >
                    <FormControl>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <TextField
                            {...register("email")}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            id="email"
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={errors.email?.message ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            {...register("password")}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            id="password"
                            name="password"
                            placeholder="******"
                            type={showPassword ? 'text' : 'password'} 
                            autoComplete="current-password"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={errors.password?.message ? 'error' : 'primary'}
                            slotProps={{
                                input: { 
                                    endAdornment: (
                                        <InputAdornment position="end">
                                          <IconButton
                                            aria-label={
                                                showPassword ? 'hide the password' : 'display the password'
                                            }
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                          >
                                            {showPassword ? <VisibilityOff /> : <VisibilityIcon />}
                                          </IconButton>
                                        </InputAdornment>
                                    ),
                                }
                            }}
                        />
                    </FormControl>
                    <FormControlLabel
                        control={<Checkbox value="remember" color={colors.grey[600]}/>}
                        label="Remember me"
                    />
                    <ForgotPassword open={open} handleClose={handleClose}></ForgotPassword>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                    >
                        Sign in
                    </Button>
                    <Link
                        component="button"
                        type="button"
                        onClick={handleClickOpen}
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                    >
                        Forgot your password?
                    </Link>
                </Box>

                <Divider>
                    {/* or */}
                </Divider>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography sx={{ textAlign: 'center' }}>
                      Don&apos;t have an account?{' '}
                      <Link
                        to="/register"
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                      >
                        Sign up
                      </Link>
                    </Typography>
                </Box>
            </Card>
        </SignInContainer>
        
        // <form onSubmit={handleSubmit(onSubmit)}>
        //     <div>
        //         <label>Name:</label>
        //         <input {...register("name")} />
        //         <p>{errors.name?.message}</p>
        //     </div>

        //     <div>
        //         <label>Password:</label>
        //         <input type="password" {...register("password")} />
        //         <p>{errors.password?.message}</p>
        //     </div>

        //     <button type="submit">Login</button>
        // </form>
    )
}

export default Login