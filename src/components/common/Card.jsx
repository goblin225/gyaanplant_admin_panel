import { cn } from '@/lib/utils';

const Card = ({ 
  title, 
  description, 
  children, 
  className, 
  headerAction,
  footer
}) => {
  return (
    <div className={cn(
      "rounded-lg border border-border/60 bg-card text-card-foreground shadow-subtle transition-all",
      "hover:border-border/80 hover:shadow-md",
      className
    )}>
      {(title || description) && (
        <div className="flex justify-between items-start p-6 pb-3">
          <div>
            {title && <h3 className="text-lg font-medium">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          {headerAction && (
            <div>
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className="p-6 pt-3">
        {children}
      </div>
      {footer && (
        <div className="border-t border-border/60 bg-muted/20 p-4 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;