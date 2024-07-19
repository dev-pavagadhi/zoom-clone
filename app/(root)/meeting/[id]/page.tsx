"use client";

import Loader from "@/components/Loader";
import MeetingRoom from "@/components/MeetingRoom";
import MeetingSetup from "@/components/MeetingSetup";
import { useGetCallById } from "@/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import React, { useState } from "react";

const Page = ({ params: { id } }: { params: { id: string } }) => {
  const { user, isLoaded } = useUser();
  const [issetUpComplete, setIsSetupComplete] = useState(false);
  const { call, isCallloading } = useGetCallById(id);

  if (!isLoaded || isCallloading) return <Loader />;
  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!issetUpComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default Page;
