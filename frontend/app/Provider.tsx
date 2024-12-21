import React, { ReactNode } from 'react';
import { OktoProvider, BuildType } from 'okto-sdk-react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const OKTO_CLIENT_API_KEY = process.env["NEXT_PUBLIC_OKTO_CLIENT_API_KEY"] as string;
const GOOGLE_CLIENT_ID = process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] as string

function Provider({ children }: { children: ReactNode }) {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <OktoProvider apiKey={OKTO_CLIENT_API_KEY} buildType={BuildType.SANDBOX}>
                {children}
            </OktoProvider>
        </GoogleOAuthProvider>
    );
}
export default Provider;