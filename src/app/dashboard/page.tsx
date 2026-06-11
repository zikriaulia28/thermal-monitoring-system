"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, Thermometer, Droplet } from "lucide-react";

import StatCard from "@/components/cards/StatCard";
import RealtimeChart from "@/components/charts/RealtimeChart";
import EventTable from "@/components/tables/EventTable";

import { Device } from "@/types/device";
import { getChartData } from "@/types/dashboard";

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getChartData();
        setDevices(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();

    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  const onlineDevices = devices.filter((d) => d.status === "online").length;
  const offlineDevices = devices.filter((d) => d.status === "offline").length;

  let totalTemp = 0;
  let totalHum = 0;
  let devicesWithData = 0;

  devices.forEach((device) => {
    const latest = device.readings.at(-1);

    if (latest) {
      totalTemp += latest.temperature;
      totalHum += latest.humidity;
      devicesWithData++;
    }
  });

  const avgTemperature =
    devicesWithData > 0 ? Math.round(totalTemp / devicesWithData) : 0;

  const avgHumidity =
    devicesWithData > 0 ? Math.round(totalHum / devicesWithData) : 0;

  const dynamicStats = [
    {
      title: "Device Online",
      value: `${onlineDevices}`,
      icon: Wifi,
    },
    {
      title: "Device Offline",
      value: `${offlineDevices}`,
      icon: WifiOff,
    },
    {
      title: "Temperature Average",
      value: `${avgTemperature}°C`,
      icon: Thermometer,
    },
    {
      title: "Humidity Average",
      value: `${avgHumidity}%`,
      icon: Droplet,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsif */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Realtime IoT Monitoring Dashboard
        </p>
      </div>

      {/* Stats Cards - Grid Responsif */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {dynamicStats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Main Content - Side by side di desktop */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart - Full width di mobile, 2/3 di desktop */}
        <div className="w-full xl:col-span-2">
          <RealtimeChart devices={devices} />
        </div>

        {/* Event Table - Full width di mobile, 1/3 di desktop */}
        <div className="w-full xl:col-span-1">
          <EventTable devices={devices} />
        </div>
      </div>
    </div>
  );
}
