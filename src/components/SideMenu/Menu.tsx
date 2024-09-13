import {
  ActivitySquare,
  LayoutDashboard,
  Mail,
  MessageSquareMore,
  PlusIcon,
  Settings,
  Settings2,
  StarIcon,
} from "lucide-react";
import { MailWarning, Inbox } from "lucide-react";

import DashboardIcon from "../../../constant/icons/DashboardIcon";
import { MenuTypes } from "../../../typing";

export const SIDE_BAR_MENU: MenuTypes[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard />,
    path: "/view-chatbot",
  },
  {
    label: "Create",
    icon: <PlusIcon />,
    path: "/create-chatbot",
  },
  {
    label: "Chatlogs",
    icon: <MessageSquareMore />,
    path: "/chatlogs",
  },
  // {
  //   label: "Integrations",
  //   icon: <Settings2 />,
  //   path: "/integration",
  // },
  {
    label: "Analytics",
    icon: <ActivitySquare />,
    path: "/analytic",
  },
  // {
  //   label: "Email",
  //   icon: <Mail />,
  //   path: "/email_compaign",
  // },
  {
    label: "Settings",
    icon: <Settings />,
    path: "/settings",
  },
];
type TABS_MENU_PROPS = {
  label: string;
  icon?: JSX.Element;
};

export const TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: "active messages",
    icon: <Mail />,
  },
  {
    label: "all messages",
    icon: <Inbox />,
  },
  // {
  //   label: "starred",
  //   icon: <StarIcon />,
  // },
  // {
  //   label: "expired",
  //   icon: <StarIcon />,
  // },
];
