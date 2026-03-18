import { toast } from "sonner"

export const useToast = () => {
  return {
    toast: ({ title, description, variant, className }: { title: string, description: string, variant?: "default" | "destructive", className?: string }) => {
      toast(title, {
        description,
        className: variant === "destructive" ? "bg-red-600 text-white border-none" : className,
      })
    }
  }
}
