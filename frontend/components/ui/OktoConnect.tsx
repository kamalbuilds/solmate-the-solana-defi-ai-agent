import React, { useState } from "react";
import { OktoContextType, useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "./button";

function OktoConnect() {
    const { authenticate, logOut, isLoggedIn } = useOkto() as OktoContextType;
    const [authToken, setAuthToken] = useState(null);

    const handleGoogleLogin = async (credentialResponse) => {
        const idToken = credentialResponse.credential;

        authenticate(idToken, (authResponse, error) => {
            if (authResponse) {
                setAuthToken(authResponse.auth_token);
                console.log("Authenticated successfully, auth token:", authResponse.auth_token);
            } else if (error) {
                console.error("Authentication error:", error);
            }
        });
    };

    return (
        <div>
            {!isLoggedIn ? (
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={(error) => console.error("Login Failed", error)}
                />
            ) : (
                <Button variant='outline' onClick={logOut}>Logout</Button>
            )}
        </div>
    );
}

export default OktoConnect;