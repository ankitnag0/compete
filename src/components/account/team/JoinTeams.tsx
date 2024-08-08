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
import { useState, useCallback } from "react";
import _ from "lodash";
import { Check, UserPlus } from "lucide-react";
import { toast, useToast } from "@/components/ui/use-toast";
import { searchTeams, sendJoinRequest } from "@/actions/team-actions";

interface Team {
  id: number;
  name: string;
  captainId: number;
  type: "duo" | "squad";
}

export default function JoinTeams() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Join Teams</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join Teams</DialogTitle>
            <DialogDescription>
              Search for teams and send join requests
            </DialogDescription>
          </DialogHeader>
          <JoinTeamForm onOpenChange={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Join Teams</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Join Teams</DrawerTitle>
          <DrawerDescription>
            Search for teams and send join requests
          </DrawerDescription>
        </DrawerHeader>
        <JoinTeamForm className="px-4" onOpenChange={setOpen} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type JoinTeamFormProps = React.ComponentProps<"form"> & {
  onOpenChange: (state: boolean) => void;
};

function JoinTeamForm({ className, onOpenChange }: JoinTeamFormProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Team[]>([]);
  const [joinedTeams, setJoinedTeams] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const fetchResults = async (searchQuery: string) => {
    const response = await searchTeams(searchQuery);
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

  const handleJoinTeam = async (teamId: number) => {
    try {
      const response = await sendJoinRequest(teamId);
      if (response.success) {
        setJoinedTeams((prev) => new Set(prev.add(teamId)));
        toast({
          title: "Join request sent!",
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
    <div className={cn("p-4", className)}>
      <Input
        type="text"
        placeholder="Search for teams..."
        value={query}
        onChange={handleInputChange}
        className="mb-4"
      />
      <div className="h-64 overflow-y-scroll space-y-2 px-4">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div
              key={index}
              className="flex justify-between items-center border rounded-md p-2"
            >
              <span>{result.name}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleJoinTeam(result.id)}
                disabled={joinedTeams.has(result.id)}
              >
                {joinedTeams.has(result.id) ? <Check /> : <UserPlus />}
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
