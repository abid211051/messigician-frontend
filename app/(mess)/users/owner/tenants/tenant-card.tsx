"use client";

import {
  Mail,
  Phone,
  Building2,
  Pencil,
  Trash2,
  MoreVertical,
  Banknote,
} from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getAvatarColor, getInitials } from "@/lib/helpers/avatar";
import { TenantData } from "./types";

interface TenantCardProps {
  tenant: TenantData;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TenantCard({
  tenant,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: TenantCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white transition-colors overflow-hidden ${
        isSelected ? "border-blue-400 bg-blue-50/30" : "border-gray-200"
      }`}
    >
      <div className="p-3">
        {/* Top row: avatar + info + checkbox */}
        <div className="flex items-start gap-2.5">
          {/* Avatar */}
          <div
            className={`w-9 h-9 rounded-lg ${getAvatarColor(tenant.fname)} flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden`}
          >
            {tenant.image_url ? (
              <Image
                src={tenant.image_url}
                alt={tenant.fname}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(tenant.fname)
            )}
          </div>

          {/* Name + phone + email */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 leading-tight truncate">
              {tenant.fname}
            </p>
            {tenant.phone && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Phone className="w-3 h-3 shrink-0" />
                <span className="truncate">{tenant.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{tenant.email}</span>
            </div>
          </div>

          {/* Checkbox — top right */}
          <div className="shrink-0 pt-0.5">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={`Select ${tenant.fname}`}
            />
          </div>
        </div>

        {/* Bottom strip: sub-mess + rent + three-dot */}
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0 mr-2">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="font-medium truncate">{tenant.sub_mess_name}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-brand-primary">
              <Banknote className="w-3.5 h-3.5" />
              <span className="font-bold text-sm">
                ৳{tenant.rent_amount.toLocaleString()}
              </span>
            </div>

            {/* Three-dot — bottom right */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-600 -mr-1"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => onEdit(tenant.id)}>
                  <Pencil className="w-3.5 h-3.5 mr-2 text-gray-500" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(tenant.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
