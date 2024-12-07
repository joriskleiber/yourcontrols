import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import clsx from "clsx";
import { Separator } from "@/components/ui/separator";
import { commands } from "@/types/bindings";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import StyledFormField from "@/components/StyledFormField";

const formSchema = z.object({
  username: z
    .string({ required_error: "Username is required!" })
    .trim()
    .min(1, { message: "Username is required" }),
  aircraft: z
    .string({ required_error: "Aircraft is required!" })
    .min(1, { message: "Aircraft is required" }),
  instructorMode: z.boolean(),
  streamerMode: z.boolean(),
});

type FormSchema = z.infer<typeof formSchema>;

const Settings: React.FC = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    reValidateMode: "onSubmit",
    defaultValues: {
      username: "",
      aircraft: "",
      instructorMode: false,
      streamerMode: false,
    },
  });

  const [aircraftConfigs, setAircraftConfigs] =
    useState<Awaited<ReturnType<typeof commands.getAircraftConfigs>>>();

  // TODO: sort aircraftConfigs category alphabetically
  useEffect(() => {
    commands
      .getAircraftConfigs()
      .then((payload) => {
        setAircraftConfigs(payload);
      })
      .catch(console.error);
  }, []);

  const onSubmit = ({
    username,
    aircraft,
    instructorMode,
    streamerMode,
  }: FormSchema) => {
    console.log("onSubmit", username, aircraft);

    commands
      .saveSettings(username, aircraft, instructorMode, streamerMode)
      .catch(console.error);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StyledFormField
              control={form.control}
              name="username"
              label="Username"
              render={({ field }) => (
                <Input
                  className="w-3/5"
                  placeholder="Launchpad McQuack"
                  autoComplete="off"
                  {...field}
                />
              )}
            />

            <StyledFormField
              control={form.control}
              name="aircraft"
              label="Aircraft"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!aircraftConfigs}
                >
                  <SelectTrigger
                    className={clsx(
                      "w-3/5",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <SelectValue placeholder="Sun Chaser" />
                  </SelectTrigger>
                  <SelectContent>
                    {aircraftConfigs &&
                      Object.entries(aircraftConfigs).map(
                        ([category, aircraftArray]) => (
                          <SelectGroup
                            key={category}
                            className="group -m-1 select-none"
                          >
                            <Separator className="group-first:hidden" />
                            <SelectLabel className="dark:bg-white/5">
                              {category}
                            </SelectLabel>
                            <Separator />
                            {aircraftArray.map((aircraftConfig) => (
                              <SelectItem
                                key={category + aircraftConfig.name}
                                value={aircraftConfig.path}
                              >
                                {aircraftConfig.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ),
                      )}
                  </SelectContent>
                </Select>
              )}
            />

            <StyledFormField
              control={form.control}
              name="instructorMode"
              label="Instructor Mode"
              description="New connections will be automatically placed in observer mode."
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />

            <StyledFormField
              control={form.control}
              name="streamerMode"
              label="Streamer Mode"
              description="Hides your IP and the session code after connecting."
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </CardContent>
          <CardFooter>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button type="submit" variant="constructive" className="w-full">
                  Save Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Save Changes For Next Session
              </TooltipContent>
            </Tooltip>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default Settings;