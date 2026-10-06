"use client"

import setupLocatorUI from '@locator/runtime';
import { useEffect } from 'react';

export default function LocatorProvider() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            setupLocatorUI();
        }
    }, []);

    return null;
}