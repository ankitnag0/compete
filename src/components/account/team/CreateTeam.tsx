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
import { createTeam } from "@/actions/team-actions";
import { useToast } from "@/components/ui/use-toast";

export default function CreateTeam() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Create Team</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>Give a name and selec type.</DialogDescription>
          </DialogHeader>
          <CreateTeamForm onOpenChange={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Create Team</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Team</DrawerTitle>
          <DrawerDescription>Give a name and select type.</DrawerDescription>
        </DrawerHeader>
        <CreateTeamForm className="px-4" onOpenChange={setOpen} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type CreateTeamFormProps = React.ComponentProps<"form"> & {
  onOpenChange: (state: boolean) => void;
};

function CreateTeamForm({ className, onOpenChange }: CreateTeamFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof CreateTeamSchema>>({
    resolver: zodResolver(CreateTeamSchema),
    defaultValues: {
      teamName: "",
      teamType: "duo",
    },
  });
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof CreateTeamSchema>) {
    const response = await createTeam(values);
    if (response.error) {
      toast({
        title: "Error",
        description: response.error.toString(),
      });
    }
    if (response.success) {
      toast({
        title: "Success",
        description: response.message,
      });
      onOpenChange(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        // className="space-y-4 p-4 pb-0"
        className={cn("grid items-start gap-4", className)}
      >
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your team name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the type of team" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="duo">Duo</SelectItem>
                  <SelectItem value="squad">Squad</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
