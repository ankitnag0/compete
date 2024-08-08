"use client";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CreateTeamSchema from "@/lib/schema/CreateTeamSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  inviteUserToTeam,
  searchUsers,
  updateTeam,
} from "@/actions/team-actions";
import { toast, useToast } from "@/components/ui/use-toast";
import { useState, useCallback } from "react";
import _ from "lodash";
import { Check, UserPlus } from "lucide-react";

interface Team {
  id: number;
  name: string;
  captainId: number;
  type: "duo" | "squad";
}

type AddMemeberProps = {
  team: Team;
};

export default function AddMember({ team }: AddMemeberProps) {
  const [open, setOpen] = React.useState(false);
  // const isDesktop = useMediaQuery("(min-width: 768px)");

  // if (isDesktop) {
  //   return (
  //     <Dialog open={open} onOpenChange={setOpen}>
  //       <DialogTrigger asChild>
  //         <Button variant="outline">Update Team</Button>
  //       </DialogTrigger>
  //       <DialogContent className="sm:max-w-[425px]">
  //         <DialogHeader>
  //           <DialogTitle>Edit Team</DialogTitle>
  //           <DialogDescription>Give a name and selec type.</DialogDescription>
  //         </DialogHeader>
  //         <UpdateTeamForm onOpenChange={setOpen} team={team} />
  //       </DialogContent>
  //     </Dialog>
  //   );
  // }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Add Members</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Members</DrawerTitle>
          <DrawerDescription>
            Search and invite players to join you team
          </DrawerDescription>
        </DrawerHeader>
        <AddMemberForm className="px-4" onOpenChange={setOpen} team={team} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type AddMemberFormProps = React.ComponentProps<"form"> & {
  onOpenChange: (state: boolean) => void;
  team: Team;
};

type User = {
  id: number;
  email: string;
  phone: string | null;
  gamerTag: string | null;
};

function AddMemberForm({ className, onOpenChange, team }: AddMemberFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [addedUsers, setAddedUsers] = useState<Set<number>>(new Set());

  const fetchResults = async (searchQuery: string) => {
    const response = await searchUsers(searchQuery);
    if (response.data) {
      setResults(response.data);
    }
  };

  const debouncedFetchResults = React.useCallback(
    _.debounce((searchQuery) => fetchResults(searchQuery), 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchResults(value);
  };
  const handleAddMember = async (userId: number) => {
    try {
      const response = await inviteUserToTeam(team.id, userId);
      if (response.success) {
        setAddedUsers((prev) => new Set(prev.add(userId)));
        toast({
          title: "Request sent!",
        });
      } else {
        toast({
          title: "Failed to send request",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="p-4">
      <Input
        type="text"
        placeholder="Search for players..."
        value={query}
        onChange={handleInputChange}
        className="mb-4"
      />
      <div className="h-64 overflow-y-scroll space-y-2 px-4">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div
              key={index}
              className=" flex justify-between items-center border rounded-md p-2"
            >
              <span>{result.gamerTag}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddMember(result.id)}
                disabled={addedUsers.has(result.id)}
              >
                {addedUsers.has(result.id) ? <Check /> : <UserPlus />}{" "}
              </Button>
            </div>
          ))
        ) : (
          <div>No results found</div>
        )}
      </div>
    </div>
  );
}
