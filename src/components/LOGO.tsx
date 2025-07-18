import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

function Logo({ msg }: { msg?: string }) {
    return (
        <Link href="/" className="cursor-pointer flex flex-row items-center">
            <Image src="/logo_icon.png" alt="Handwriting Logo" width={48} height={48} />
            {msg && <h1 className="text-xs text-gray-600">{msg}</h1>}
        </Link>
    );
}

export default Logo;