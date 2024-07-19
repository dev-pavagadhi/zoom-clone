"use client";

import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import MeetingModel from "./MeetingModel";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useToast } from "./ui/use-toast";
import { Textarea } from "./ui/textarea";
import ReactDatePicker from "react-datepicker";
import { Input } from "./ui/input";

const MeetingTypeList = () => {
  const router = useRouter();
  const [meeting, setMeeting] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();

  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });

  const [callDetails, setCallDetails] = useState<Call>();
  const { toast } = useToast();

  const { user } = useUser();
  const client = useStreamVideoClient();

  const createMeeting = async () => {
    if (!user || !client) return;

    try {
      if (!values.dateTime) {
        toast({ title: "please select date and time" });
        return;
      }
      const id = crypto.randomUUID();

      const call = client.call("default", id);

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant Meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      setCallDetails(call);

      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({ title: "Meeting created successfully" });

      if (!call) throw new Error("Failed to create call");
    } catch (error) {
      console.error(error);
      toast({ title: "failed to create meeting" });
    }
  };
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an Instant Meeting"
        handleClick={() => setMeeting("isInstantMeeting")}
        className="bg-orange-1"
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your Meeting"
        handleClick={() => setMeeting("isScheduleMeeting")}
        className="bg-blue-1"
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Check out your Recordings"
        handleClick={() => router.push("/recordings")}
        className="bg-purple-1"
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via an invitation"
        handleClick={() => setMeeting("isJoiningMeeting")}
        className="bg-yellow-1"
      />

      {!callDetails ? (
        <MeetingModel
          isOpen={meeting === "isScheduleMeeting"}
          onClose={() => setMeeting(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px]">
              Add A Description
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => {
                setValues({ ...values, description: e.target.value });
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px]">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d,yyyy h:mm aa"
              className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />
          </div>
        </MeetingModel>
      ) : (
        <MeetingModel
          isOpen={meeting === "isScheduleMeeting"}
          onClose={() => setMeeting(undefined)}
          title="Meeting Created"
          className="text-center"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: "Link Copied" });
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          buttonText="Copy Meeting Link"
        />
      )}

      <MeetingModel
        isOpen={meeting === "isInstantMeeting"}
        onClose={() => setMeeting(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />

      <MeetingModel
        isOpen={meeting === "isJoiningMeeting"}
        onClose={() => setMeeting(undefined)}
        title="Type The Link Here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={()=>router.push(values.link)}
      >
      <Input placeholder="Meeting Link" className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0" onChange={(e)=>setValues({...values,link:e.target.value})}/>


      </MeetingModel>
    </section>
  );
};

export default MeetingTypeList;
