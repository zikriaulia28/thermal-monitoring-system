export async function getOverview() {
  const res = await fetch("/api/dashboard/overview", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch overview");
  }

  return res.json();
}

export async function getChartData() {
  const res = await fetch("/api/dashboard/chart", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch chart data");
  }

  return res.json();
}
