import { cn } from '@/lib/utils';

const StatusBadge = ({ status, variant = 'default', className }) => {
  const variantStyles = {
    default: 'bg-primary/10 text-primary dark:bg-primary/20 border border-primary/20',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200',
    outline: 'border border-border text-foreground dark:border-border/50 '
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;