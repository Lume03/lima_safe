'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PathResult } from '@/types';
import { MapPinned, AlertTriangle, Sigma, Route } from 'lucide-react';
import { getDangerColor } from '@/lib/graph';

interface ResultsDisplayProps {
  pathResult: PathResult;
  aiAdjustmentReason?: string | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ pathResult, aiAdjustmentReason }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <MapPinned className="mr-2 h-6 w-6" /> Route Details
        </CardTitle>
        {aiAdjustmentReason && (
          <CardDescription className="font-code text-sm text-blue-600 dark:text-blue-400">
            AI Adjustment: {aiAdjustmentReason}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1 flex items-center">
            <Route className="mr-2 h-5 w-5 text-muted-foreground"/> Path
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            {pathResult.pathNodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <Badge variant="secondary" className="text-sm px-3 py-1">{node.name}</Badge>
                {index < pathResult.pathNodes.length - 1 && (
                  <span className="text-muted-foreground font-bold">&rarr;</span>
                )}
              </React.Fragment>
            ))}
          </div>
           {pathResult.pathNodes.length === 0 && <p className="text-muted-foreground">No path calculated yet.</p>}
           {pathResult.pathNodes.length === 1 && <p className="text-muted-foreground">Origin and destination are the same.</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-secondary/50 rounded-md">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center">
              <Route className="mr-1 h-4 w-4"/> Total Distance
            </h4>
            <p className="font-code text-xl font-bold">{pathResult.totalDistance.toFixed(2)} km</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-md">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center">
              <AlertTriangle className="mr-1 h-4 w-4"/> Total Danger Score
            </h4>
            <p className="font-code text-xl font-bold">{pathResult.totalDangerScore.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-md">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center">
             <Sigma className="mr-1 h-4 w-4"/> Weighted Cost
            </h4>
            <p className="font-code text-xl font-bold">{pathResult.totalWeightedCost.toFixed(2)}</p>
          </div>
        </div>
        
        {pathResult.segments.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2 mt-4">Route Segments:</h3>
            <ul className="space-y-2">
              {pathResult.segments.map((segment, index) => (
                <li key={index} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <span className="font-medium">{segment.from.name}</span> &rarr; <span className="font-medium">{segment.to.name}</span>
                    <p className="text-xs text-muted-foreground font-code">
                      Dist: {segment.distance.toFixed(1)}km, Danger: {segment.danger}, Cost: {segment.weightedCost.toFixed(1)}
                    </p>
                  </div>
                  <Badge style={{ backgroundColor: getDangerColor(segment.danger), color: segment.danger > 2 ? 'white' : 'black' }}>
                    Danger: {segment.danger}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
