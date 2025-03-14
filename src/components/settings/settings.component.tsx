"use client";
import { Modal } from "@components/modal/modal.component";
import { useModal } from "@components/modal/use-modal.hook";
import { Sidebar } from "@components/sidebar/sidebar.component";
import { useEffect } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

export function Settings() {
  const { ref, isOpen, open, close } = useModal();
  const tabClassName =
    "border-0 cursor-pointer font-[400] text-gray-360 w-full flex items-center gap-2 px-2 aria-[current=page]:bg-gray-240/60 aria-[current=page]:font-[500] aria-[current=page]:text-white-500 hover:bg-gray-260/30 hover:text-gray-150 py-1 rounded-sm";

  useEffect(() => {
    open();
  }, [open]);

  return (
    <section className="w-full">
      <Tabs className="flex h-full">
        <Sidebar
          withFooter={false}
          className="bg-black-630 max-w-none w-2/5 lg:max-w-none flex flex-col items-end"
        >
          <h2>User settings</h2>
          <TabList className="flex flex-col">
            <Tab className={tabClassName}>User details</Tab>
            <Tab className={tabClassName}>User profiles</Tab>
          </TabList>
        </Sidebar>
        <TabPanel className="grow hidden">user details</TabPanel>
        <TabPanel className="grow hidden">user profiles</TabPanel>
      </Tabs>
    </section>
  );
}
