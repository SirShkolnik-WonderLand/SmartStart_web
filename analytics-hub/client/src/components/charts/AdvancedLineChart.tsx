/**
 * ADVANCED LINE CHART
 * D3.js powered line chart with smooth animations and interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface AdvancedLineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showTooltip?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  title?: string;
  subtitle?: string;
}

const ChartContainer = styled(motion.div)`
  background: ${(props) => props.theme.colors.card};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${(props) => props.theme.neumorphic.shadowLight};
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: ${(props) => props.theme.neumorphic.shadowDark};
  }
`;

const ChartTitle = styled.h3`
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 18px;
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 8px 0;
`;

const ChartSubtitle = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: ${(props) => props.theme.colors.text}80;
  margin: 0 0 24px 0;
`;

const Tooltip = styled.div<{ visible: boolean; x: number; y: number }>`
  position: absolute;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transform: translate(${(props) => props.x}px, ${(props) => props.y}px);
  transition: opacity 0.2s ease;
`;

export const AdvancedLineChart: React.FC<AdvancedLineChartProps> = ({
  data,
  width = 400,
  height = 300,
  color = '#4a90e2',
  showTooltip = true,
  showGrid = true,
  animated = true,
  title,
  subtitle,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
  });

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Create line generator
    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Create area generator
    const area = d3
      .area<DataPoint>()
      .x((d) => xScale(new Date(d.date)))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines
    if (showGrid) {
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);

      g.append('g')
        .attr('class', 'grid')
        .call(
          d3
            .axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.3);
    }

    // Add area
    g.append('path')
      .datum(data)
      .attr('fill', color)
      .attr('fill-opacity', 0.1)
      .attr('d', area)
      .style('opacity', animated ? 0 : 1)
      .transition()
      .duration(animated ? 1000 : 0)
      .style('opacity', 1);

    // Add line
    const path = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line)
      .style('opacity', animated ? 0 : 1);

    if (animated) {
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .style('opacity', 1);
    }

    // Add dots
    const dots = g
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(new Date(d.date)))
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 0)
      .attr('fill', color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    if (animated) {
      dots
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr('r', 4);
    } else {
      dots.attr('r', 4);
    }

    // Add tooltip interactions
    if (showTooltip) {
      dots
        .on('mouseover', function (event, d) {
          d3.select(this).attr('r', 6);
          setTooltip({
            visible: true,
            x: event.pageX - 10,
            y: event.pageY - 10,
            content: `${d.label || d.date}: ${d.value.toLocaleString()}`,
          });
        })
        .on('mousemove', function (event) {
          setTooltip((prev) => ({
            ...prev,
            x: event.pageX - 10,
            y: event.pageY - 10,
          }));
        })
        .on('mouseout', function () {
          d3.select(this).attr('r', 4);
          setTooltip((prev) => ({ ...prev, visible: false }));
        });
    }

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %d')))
      .style('color', '#666')
      .style('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.0s')))
      .style('color', '#666')
      .style('font-size', '12px');
  }, [data, width, height, color, showTooltip, showGrid, animated]);

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {title && <ChartTitle>{title}</ChartTitle>}
      {subtitle && <ChartSubtitle>{subtitle}</ChartSubtitle>}
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
      
      {showTooltip && (
        <Tooltip
          visible={tooltip.visible}
          x={tooltip.x}
          y={tooltip.y}
        >
          {tooltip.content}
        </Tooltip>
      )}
    </ChartContainer>
  );
};
