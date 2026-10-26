"use client";

import React from "react";

// Types
interface StatusDataPoint {
    status: string;
    count: number;
    color: string;
}

interface TooltipPayload {
    value?: number;
    dataKey?: string;
    stroke?: string;
    payload?: any;
    name?: string;
    color?: string;
}

interface CommonTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

export const CustomBarTooltip = ({ active, payload }: CommonTooltipProps) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0];
        // Handle both payload structures (direct object or nested payload)
        const status = data.payload?.status || data.payload?.name || data.name;
        const color = data.payload?.color || data.color || data.payload?.fill || "var(--primary)";
        const value = data.value;

        return (
            <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-4 shadow-xl">
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground">
                        {status}
                    </p>
                    <div className="flex items-center gap-2">
                        <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <p className="text-sm text-muted-foreground">
                            Count:{" "}
                            <span className="font-semibold text-foreground">
                                {value}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const CustomAreaTooltip = ({ active, payload, label }: CommonTooltipProps) => {
    if (active && payload && payload.length > 0) {
        return (
            <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-4 shadow-xl">
                <div className="flex flex-col gap-2.5">
                    <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
                        {label}
                    </p>
                    {payload.map((entry, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: entry.stroke || entry.color }}
                                />
                                <p className="text-sm text-muted-foreground capitalize">
                                    {entry.name}
                                </p>
                            </div>
                            <span className="font-semibold text-foreground">
                                {typeof entry.value === 'number'
                                    ? entry.value.toLocaleString()
                                    : entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export const CustomPieTooltip = ({ active, payload }: CommonTooltipProps) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0];
        return (
            <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-4 shadow-xl">
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-foreground">
                        {data.name}
                    </p>
                    <div className="flex items-center gap-2">
                        <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: data.payload.fill || data.color }}
                        />
                        <p className="text-sm text-muted-foreground">
                            Value:{" "}
                            <span className="font-semibold text-foreground">
                                {data.value}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};
