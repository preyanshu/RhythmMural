'use client';

import './globals.css';
import { AuthContextProvider } from '@/context/AuthContext';
import { ToastContainer } from 'react-toastify';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<AuthContextProvider>{children}</AuthContextProvider>
				<ToastContainer />
			</body>
		</html>
	);
}
