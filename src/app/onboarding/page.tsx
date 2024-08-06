"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import OnboardingSchema from "@/lib/schema/OnboardingSchema";
import { completeOnboarding } from "./_actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingForm() {
  const router = useRouter();
  const { toast } = useToast();
  // 1. Define your form.
  const form = useForm<z.infer<typeof OnboardingSchema>>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      phone: "",
      gamerTag: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof OnboardingSchema>) {
    const response = await completeOnboarding(values);
    if (!response.success) {
      toast({
        title: "Error",
        description: response.error?.toString(),
      });
      return;
    }
    if (response.success) {
      toast({
        title: "Success",
        description: response.message,
      });
      router.push("/account");
      return;
    }
  }

  return (
    <main className="flex h-screen justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gamerTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gamer Tag</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your gamer tag" {...field} />
                    </FormControl>
                    <FormDescription>
                      You can find this in your profile page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
