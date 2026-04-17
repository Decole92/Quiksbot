import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FacebookLoginButtonProps {
  onClick: () => void;
  disabled: boolean;
  isPending?: boolean;
}

export const FacebookLoginButton = ({
  onClick,
  disabled,
  isPending = false,
}: FacebookLoginButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isPending}
      className='bg-[#1877f2] text-white px-6 py-2 rounded font-bold hover:bg-[#1666d2] disabled:bg-gray-400'
    >
      {isPending ? "Processing..." : "Connect WhatsApp"}
    </Button>
  );
};
