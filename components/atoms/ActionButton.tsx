import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { Loader2 } from 'lucide-react';

interface ActionButtonProps {
    onClick: () => Promise<void>;
    label: string;
    variant?: 'default' | 'destructive' | 'outline';
}

export function ActionButton({ onClick, label, variant = 'default' }: ActionButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (isLoading) return; // Mencegah multiple clicks 

        setIsLoading(true);
        try {
            await onClick();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleClick} disabled={isLoading} variant={variant}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Processing...' : label}
        </Button>
    );
}