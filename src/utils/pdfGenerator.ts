import jsPDF from 'jspdf';
import type { Post } from '../types';
import { getImageUrl } from './imageHelper';
import { format, startOfMonth, startOfWeek, addDays, isSameMonth, parseISO, addMonths, isBefore, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { SOCIAL_ICONS } from '../socialIcons';

const getDataUrl = (url: string): Promise<{ base64: string, width: number, height: number } | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0);
            try {
                resolve({
                    base64: canvas.toDataURL('image/jpeg', 0.8),
                    width: img.width,
                    height: img.height
                });
            } catch (e) {
                resolve(null);
            }
        };
        img.onerror = () => {
            resolve(null);
        };
    });
};

export const generatePDFRequest = async (
    posts: Post[],
    startDateStr: string,
    endDateStr: string,
    reportTitle: string,
    translations: Record<string, string>,
    language: 'en' | 'es' = 'es'
) => {
    // 1. Pre-load all images
    const imageMap = new Map<string | number, { base64: string, width: number, height: number }>();

    // Parallel fetch
    await Promise.all(posts.map(async (post) => {
        if (!post.image) return;
        const url = getImageUrl(post.image);
        if (!url) return;

        if (url.startsWith('data:')) {
            // For data URLs, we need to load them to get dimensions too
            const data = await getDataUrl(url);
            if (data && post.id) imageMap.set(post.id, data);
            return;
        }

        const data = await getDataUrl(url);
        if (data && post.id) {
            imageMap.set(post.id, data);
        }
    }));

    // Landscape A4: 297mm x 210mm
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth(); // 297
    const pageHeight = doc.internal.pageSize.getHeight(); // 210
    const margin = 10;

    // --- Helper: Shadow ---
    const drawShadowRect = (x: number, y: number, w: number, h: number, r: number) => {
        doc.setFillColor(240, 240, 240); // Lighter/Softer shadow
        doc.roundedRect(x + 1.5, y + 1.5, w, h, r, r, 'F'); // Slightly larger offset for "blur" effect feel
    };

    // --- Helper: Draw Header (Pill Design) ---
    const drawHeader = (title: string, subtitle?: string) => {
        // 1. Setup Font for accurate measurement
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold'); // Ensure bold for title

        // 2. Measure with Char Spacing
        const charSpacing = 1.5;
        const rawTextW = doc.getTextWidth(title);
        const spacingTotal = (title.length - 1) * charSpacing;
        const padding = 30;

        const pillW = rawTextW + spacingTotal + padding;
        const pillH = 14;

        // 3. Draw Pill
        doc.setFillColor(209, 213, 219); // #D1D5DB
        doc.roundedRect(margin - 2, 8, pillW, pillH, 7, 7, 'F');

        // 4. Draw Text
        doc.setTextColor(40, 40, 40);
        // Vertical Align: Rect Y=8, H=14. Middle=15. 
        // Font size 22 (~7.7mm cap height). Baseline needs to be around 15 + (7.7/3) ≈ 17.5
        doc.text(title, margin + 4, 18, { charSpace: charSpacing });

        if (subtitle) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(14);
            doc.setTextColor(80, 80, 80);
            doc.text(subtitle, margin + 6, 26);
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        // Move "Generado" to top right (above pill) to avoid collision
        doc.text(`${translations['pdf.generated']}: ${format(new Date(), 'yyyy-MM-dd')}`, pageWidth - margin, 6, { align: 'right' });

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 29, pageWidth - margin, 29); // Line below subtitle (y=26)
    };

    // --- Constants for Design ---
    const colors: Record<string, { bg: [number, number, number], text: [number, number, number], accent: [number, number, number], icon: string }> = {
        'Instagram': { bg: [253, 242, 248], text: [157, 23, 77], accent: [236, 72, 153], icon: 'IG' },
        'Facebook': { bg: [239, 246, 255], text: [30, 64, 175], accent: [59, 130, 246], icon: 'FB' },
        'TikTok': { bg: [228, 228, 231], text: [24, 24, 27], accent: [0, 0, 0], icon: 'TK' }, // Darker gray for shadow visibility
        'LinkedIn': { bg: [240, 249, 255], text: [12, 74, 110], accent: [14, 165, 233], icon: 'IN' },
        'Twitter': { bg: [240, 249, 255], text: [12, 74, 110], accent: [14, 165, 233], icon: 'X' }, // Map Twitter to Blue-ish
        'WhatsApp': { bg: [240, 253, 244], text: [20, 83, 45], accent: [34, 197, 94], icon: 'WA' },
        'Google Ads': { bg: [239, 246, 255], text: [30, 55, 155], accent: [66, 133, 244], icon: 'G' },
        'default': { bg: [243, 244, 246], text: [55, 65, 81], accent: [107, 114, 128], icon: '•' }
    };

    // --- Section 1: Calendar Grid Pages ---
    let loopDate = startOfMonth(parseISO(startDateStr));
    const finalDate = parseISO(endDateStr);

    while (isBefore(loopDate, finalDate) || isSameMonth(loopDate, finalDate)) {
        if (loopDate > startOfMonth(parseISO(startDateStr))) {
            doc.addPage();
        }

        const monthStart = startOfMonth(loopDate);
        const calendarStart = startOfWeek(monthStart);
        // Localized Month Title
        const monthName = format(monthStart, 'MMMM yyyy', { locale: language === 'es' ? es : undefined });
        const pageTitle = `${reportTitle} - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
        drawHeader(pageTitle);

        // Grid Design - Minimalist SaaS
        const startY = 38; // Increased margin from header (was 32)
        const gridHeight = pageHeight - startY - margin;
        const cellWidth = (pageWidth - (margin * 2)) / 7;
        const safeCellHeight = gridHeight / 6;
        const gap = 2;

        // Dynamic Localized Weekdays
        const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 0 });
        const weekDays = Array.from({ length: 7 }).map((_, i) =>
            format(addDays(startOfWeekDate, i), 'EEE', { locale: language === 'es' ? es : undefined }).toUpperCase()
        );

        // Header Labels
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.setFont('helvetica', 'bold');
        weekDays.forEach((day, i) => {
            const xCenter = margin + (i * cellWidth) + (cellWidth / 2);
            doc.text(day, xCenter, startY - 4, { align: 'center', charSpace: 1 });
        });

        // Loop Days
        let currentDay = calendarStart;
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const x = margin + (col * cellWidth);
                const y = startY + (row * safeCellHeight);
                const cardW = cellWidth - gap;
                const cardH = safeCellHeight - gap;
                const boxX = x + (gap / 2);
                const boxY = y + (gap / 2);

                const isCurrentMonth = isSameMonth(currentDay, monthStart);
                const isTodayDate = isToday(currentDay);

                // Day Card Background
                if (isCurrentMonth) {
                    if (isTodayDate) {
                        // Highlight Today: Electric Blue Shadow + Thicker Border
                        doc.setFillColor(100, 149, 237); // Cornflower Blue
                        doc.roundedRect(boxX + 0.5, boxY + 0.5, cardW, cardH, 2, 2, 'F');

                        doc.setFillColor(255, 255, 255);
                        doc.setDrawColor(37, 99, 235); // Blue-600
                        doc.setLineWidth(0.8);
                    } else {
                        doc.setFillColor(255, 255, 255);
                        doc.setDrawColor(209, 213, 219); // Border defined
                        doc.setLineWidth(0.2);
                    }
                } else {
                    doc.setFillColor(250, 250, 250);
                    doc.setDrawColor(229, 231, 235); // Leave empty days subtle
                    doc.setLineWidth(0.1);
                }
                doc.roundedRect(boxX, boxY, cardW, cardH, 2, 2, 'FD');

                // Day Num
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');

                if (isCurrentMonth) {
                    if (isTodayDate) doc.setTextColor(37, 99, 235); // Blue
                    else doc.setTextColor(30, 30, 30); // Dark Gray
                } else {
                    doc.setTextColor(200, 200, 200); // Light Gray
                }

                doc.text(format(currentDay, 'd'), boxX + 3, boxY + 5);

                // Posts Rendering with Icons (Max 2 + overflow)
                const dayStr = format(currentDay, 'yyyy-MM-dd');
                const dayPosts = posts.filter(p => p.date === dayStr);
                const maxVisible = 2;
                const visiblePosts = dayPosts.slice(0, maxVisible);
                const overflowCount = dayPosts.length - maxVisible;

                let postY = boxY + 8;
                visiblePosts.forEach((p) => {
                    const iconSize = 8 / 2.83465; // 8pt to mm (approx 2.82mm)
                    const pColor = colors[p.platform] || colors['default'];

                    // Prepare text
                    const timeStr = p.time.substring(0, 5);
                    let objText = p.objective || '';
                    objText = objText.replace(/^\[Li L\]\s*/i, '').trim();
                    const objClean = objText.substring(0, 14);

                    // Measurements
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(6);
                    const timeW = doc.getTextWidth(timeStr);
                    doc.setFont('helvetica', 'normal');
                    const objW = doc.getTextWidth(objClean);

                    const paddingX = 1.5;
                    const paddingY = 1;
                    const gap = 1.5;
                    const badgeW = paddingX + iconSize + gap + timeW + gap + objW + paddingX;
                    const badgeH = iconSize + (paddingY * 2);

                    // Badge Background (Pill) with Shadow
                    // Shadow
                    drawShadowRect(boxX + 1, postY, badgeW, badgeH, badgeH / 2);

                    doc.setFillColor(pColor.bg[0], pColor.bg[1], pColor.bg[2]);
                    doc.setDrawColor(pColor.bg[0], pColor.bg[1], pColor.bg[2]); // Match border to bg for cleanliness
                    doc.roundedRect(boxX + 1, postY, badgeW, badgeH, badgeH / 2, badgeH / 2, 'F');

                    // 1. Platform Icon
                    const platformKey = p.platform.toLowerCase().replace(/\s+/g, '');
                    const iconData = SOCIAL_ICONS[platformKey] || SOCIAL_ICONS['facebook'];

                    try {
                        doc.addImage(iconData, 'PNG', boxX + 1 + paddingX, postY + paddingY, iconSize, iconSize);
                    } catch (e) {
                        doc.setFillColor(pColor.accent[0], pColor.accent[1], pColor.accent[2]);
                        doc.circle(boxX + 1 + paddingX + iconSize / 2, postY + paddingY + iconSize / 2, iconSize / 2, 'F');
                    }

                    // 2. Time
                    const textY = postY + paddingY + iconSize - 0.7; // Vertical align adjustment
                    doc.setTextColor(pColor.text[0], pColor.text[1], pColor.text[2]);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(6);
                    doc.text(timeStr, boxX + 1 + paddingX + iconSize + gap, textY);

                    // 3. Objective
                    doc.setFont('helvetica', 'normal');
                    doc.text(objClean, boxX + 1 + paddingX + iconSize + gap + timeW + gap, textY);

                    postY += (badgeH + 1.5);
                });

                // Overflow indicator
                if (overflowCount > 0) {
                    doc.setTextColor(107, 114, 128);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6);
                    doc.text(`+${overflowCount} más...`, boxX + 2, postY + 2);
                }

                currentDay = addDays(currentDay, 1);
            }
        }
        loopDate = addMonths(loopDate, 1);
    }

    // --- Section 2: Investment Dashboard (Page 2) ---
    doc.addPage();
    // Smart Title: Avoid "January 2026 - January 2026"
    const startM = format(parseISO(startDateStr), 'MMMM yyyy', { locale: language === 'es' ? es : undefined });
    const endM = format(parseISO(endDateStr), 'MMMM yyyy', { locale: language === 'es' ? es : undefined });
    const dateRange = startM === endM ? startM : `${startM} - ${endM}`;

    // Capitalize
    const dateRangeCap = dateRange.replace(/\b\w/g, l => l.toUpperCase());

    const invTitle = `Resumen de Inversión - ${dateRangeCap}`;
    drawHeader(invTitle);

    const invPosts = posts.filter(p => p.date >= startDateStr && p.date <= endDateStr && p.isPaid);
    const totalBudget = invPosts.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    const avgCost = invPosts.length ? (totalBudget / invPosts.length) : 0;

    // Group by Platform
    const platformSpend: Record<string, number> = {};
    invPosts.forEach(p => {
        platformSpend[p.platform] = (platformSpend[p.platform] || 0) + (Number(p.budget) || 0);
    });

    // Cards Logic
    const dashY = 40;
    const cardGap = 10;
    const dashCardW = (pageWidth - (margin * 2) - (cardGap * 2)) / 3;
    const dashCardH = 40;

    // Draw KPI Card Helper (Premium Style)
    const drawKpiCard = (x: number, title: string, value: string, sub: string) => {
        // Softer, deeper shadow (simulated blur by layering or lighter color)
        // Offset +1.5, slightly larger dim to simulate diffuse
        doc.setFillColor(243, 244, 246); // Very soft gray shadow
        doc.roundedRect(x + 1.5, dashY + 1.5, dashCardW, dashCardH, 5, 5, 'F'); // R16px ≈ 5mm

        doc.setDrawColor(229, 231, 235); // #E5E7EB
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(0.2); // 0.5pt
        doc.roundedRect(x, dashY, dashCardW, dashCardH, 5, 5, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128); // #6b7280 (Gray-500)
        doc.text(title, x + 6, dashY + 12);

        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59); // #1e293b (Slate-800 - Navy)
        doc.setFont('helvetica', 'bold');
        doc.text(value, x + 6, dashY + 26);

        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175); // #9ca3af (Gray-400)
        doc.setFont('helvetica', 'normal');
        doc.text(sub, x + 6, dashY + 35);
    };

    drawKpiCard(margin, 'Presupuesto Total', `$${totalBudget.toFixed(2)}`, `En ${invPosts.length} posts pagados`);
    drawKpiCard(margin + dashCardW + cardGap, 'Costo Promedio', `$${avgCost.toFixed(2)}`, 'Por publicación');

    // Top Platform Check
    const sortedPlatforms = Object.entries(platformSpend).sort(([, a], [, b]) => b - a);
    const topPlat = sortedPlatforms[0] ? sortedPlatforms[0][0] : '-';
    drawKpiCard(margin + (dashCardW * 2) + (cardGap * 2), 'Top Plataforma', topPlat, sortedPlatforms[0] ? `$${sortedPlatforms[0][1]}` : '$0');

    // Premium Chart Section
    const chartY = dashY + dashCardH + 30; // Increased spacing "para que respire"

    // Layout: Bars on Left (60%), Donut on Right (40%)
    const splitX = margin + (pageWidth - (margin * 2)) * 0.65;

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Desglose por Plataforma', margin, chartY - 10);

    let barY = chartY;
    const maxVal = sortedPlatforms[0] ? sortedPlatforms[0][1] : 1;
    const maxBarW = (pageWidth - (margin * 2)) * 0.60 - 50; // Reduced width for text labels

    sortedPlatforms.forEach(([plat, amount]) => {
        const pColor = colors[plat] || colors['default'];
        const barW = (amount / maxVal) * maxBarW;

        // Icon (Aligned)
        const platformKey = plat.toLowerCase().replace(/\s+/g, '');
        const iconData = SOCIAL_ICONS[platformKey] || SOCIAL_ICONS['facebook'];
        const iconSize = 5; // Slightly larger for alignment

        // Vertically center icon relative to text/bar
        const rowH = 10;
        const iconY = barY + (rowH - iconSize) / 2;

        try {
            doc.addImage(iconData, 'PNG', margin, iconY, iconSize, iconSize);
        } catch (e) {
            doc.setFillColor(pColor.accent[0], pColor.accent[1], pColor.accent[2]);
            doc.circle(margin + 2.5, iconY + 2.5, 2.5, 'F');
        }

        // Label
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81); // Gray-700
        // Align text with Icon middle
        doc.text(plat, margin + 8, barY + 6.5);

        // Bar (Slimer & Rounded)
        const barH = 3; // Half thickness
        const barRadius = 1.5; // Fully rounded
        // Vertically align bar with text
        const barTop = barY + 4;

        doc.setFillColor(pColor.accent[0], pColor.accent[1], pColor.accent[2]);
        doc.roundedRect(margin + 40, barTop, barW, barH, barRadius, barRadius, 'F');

        // Value
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`$${amount}`, margin + 40 + barW + 5, barY + 6.5);

        barY += 14; // Spacing
    });

    // Donut Chart Implementation
    const donutCX = splitX + 40;
    const donutCY = chartY + 25;
    const donutR = 20;
    let startAngle = 0;

    // Helper: Draw Sector
    const drawSector = (cx: number, cy: number, r: number, start: number, end: number, color: [number, number, number]) => {
        const step = 0.05; // rad resolution
        doc.setFillColor(color[0], color[1], color[2]);
        // Construct path
        const lines: any[] = [];
        // Center to Start
        lines.push([cx + r * Math.cos(start) - cx, cy + r * Math.sin(start) - cy]); // Relative to last point? No, jspdf path is relative often or absolute?
        // jsPDF lines: [ [x, y], [x, y], ... ] relative to (x, y) argument
        // Easier: fillCircle sector manually?
        // We will simple trace points on perimeter

        // Workaround: Draw filled polygon
        const points: [number, number][] = [];
        points.push([cx, cy]);
        for (let a = start; a <= end; a += step) {
            points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        }
        points.push([cx + r * Math.cos(end), cy + r * Math.sin(end)]);
        points.push([cx, cy]);

        // Convert to doc.lines format? 
        // doc.lines(segments, x, y, [scale], [style], [closed])
        // segments: [ [dx, dy], [dx, dy] ]
        // This is complex to get right blindly.
        // Alternative: Thick Arcs?
        // Let's use simple tiny triangles fan if lines fails? No.

        // Let's use the 'lines' method which is robust for polygons if relative
        // Start point
        // Need to chain logic: p[i] - p[i-1] for relative lines segments? 
        // Docs say: segments is array of [dx, dy].
        const pathOps: [number, number][] = [];
        for (let i = 1; i < points.length; i++) {
            pathOps.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
        }

        doc.lines(pathOps, points[0][0], points[0][1], [1, 1], 'F', true);
    };

    sortedPlatforms.forEach(([plat, amount]) => {
        const pColor = colors[plat] || colors['default'];
        const share = totalBudget > 0 ? amount / totalBudget : 0;
        const angle = share * 2 * Math.PI;

        drawSector(donutCX, donutCY, donutR, startAngle, startAngle + angle, pColor.accent);
        startAngle += angle;
    });

    // Donut Hole (White Circle)
    doc.setFillColor(255, 255, 255);
    doc.circle(donutCX, donutCY, donutR * 0.6, 'F');

    // Total in Center
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Total', donutCX, donutCY - 2, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${Math.round(totalBudget)}`, donutCX, donutCY + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');

    // --- Section 3: Content Details (Cards) ---
    doc.addPage();
    drawHeader(`${reportTitle} - ${translations['pdf.content_details']}`);

    let y = 35;
    const cols = 2; // 2 Columns for cards as requested mainly for better width
    const colWidth = (pageWidth - (margin * 2) - (margin * (cols - 1))) / cols;
    const rowHeight = 70; // Shorter styling

    let col = 0;
    const sortedPosts = posts.filter(p => p.date >= startDateStr && p.date <= endDateStr).sort((a, b) => a.date.localeCompare(b.date));

    for (const post of sortedPosts) {
        if (y + rowHeight > pageHeight - margin) {
            doc.addPage();
            drawHeader(`${reportTitle} - ${translations['pdf.content_details']} (Cont.)`);
            y = 35;
            col = 0;
        }

        const x = margin + col * (colWidth + margin);
        const pColor = colors[post.platform] || colors['default'];

        // CARD CONTAINER
        // 1. Shadow
        drawShadowRect(x, y, colWidth, rowHeight, 3);

        // 2. Main Card with Branded Background (Pastel)
        doc.setFillColor(pColor.bg[0], pColor.bg[1], pColor.bg[2]); // Branded pastel BG
        doc.setDrawColor(209, 213, 219); // Visible Border (0.5pt style)
        doc.setLineWidth(0.2); // ~0.5pt
        doc.roundedRect(x, y, colWidth, rowHeight, 3, 3, 'FD'); // R12-15px approx 3-4mm

        // 3. Colored Left Border
        doc.setFillColor(pColor.accent[0], pColor.accent[1], pColor.accent[2]);
        doc.rect(x, y, 1.5, rowHeight, 'F'); // Left strip

        // Header: Badge Style
        const iconX = x + 6;
        const iconY = y + 8;
        const iconSize = 8 / 2.83465; // 8pt

        const platformKey = post.platform.toLowerCase().replace(/\s+/g, '');
        const iconData = SOCIAL_ICONS[platformKey] || SOCIAL_ICONS['facebook'];

        // Measure content for badge
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const headerText = `${post.platform}  |  ${post.date}`;
        const headerW = doc.getTextWidth(headerText);

        const badgePadX = 2;
        const badgePadY = 1.5;
        const badgeW = badgePadX + iconSize + 2 + headerW + badgePadX;
        const badgeH = iconSize + (badgePadY * 2);

        // Draw Badge Background
        doc.setFillColor(pColor.bg[0], pColor.bg[1], pColor.bg[2]);
        doc.roundedRect(iconX, iconY - 4, badgeW, badgeH, badgeH / 2, badgeH / 2, 'F');

        // Icon inside badge
        try {
            doc.addImage(iconData, 'PNG', iconX + badgePadX, iconY - 4 + badgePadY, iconSize, iconSize);
        } catch (e) {
            doc.setFillColor(pColor.accent[0], pColor.accent[1], pColor.accent[2]);
            doc.circle(iconX + badgePadX + iconSize / 2, iconY - 4 + badgePadY + iconSize / 2, iconSize / 2, 'F');
        }

        // Text inside badge
        doc.setTextColor(pColor.text[0], pColor.text[1], pColor.text[2]);
        doc.text(headerText, iconX + badgePadX + iconSize + 2, iconY + 0.5);

        // Image (Object Fit: Contain)
        const imgData = imageMap.get(post.id!);
        const containerSize = 40;
        const imgX = x + 6;
        const imgYpos = iconY + 6;

        if (imgData) {
            try {
                // Calculate Aspect Ratio Fit
                const scale = Math.min(containerSize / imgData.width, containerSize / imgData.height);
                const drawW = imgData.width * scale;
                const drawH = imgData.height * scale;
                const offsetX = (containerSize - drawW) / 2;
                const offsetY = (containerSize - drawH) / 2;

                doc.addImage(imgData.base64, 'JPEG', imgX + offsetX, imgYpos + offsetY, drawW, drawH);
            } catch (e) { }
        } else {
            doc.setFillColor(243, 244, 246);
            doc.rect(imgX, imgYpos, containerSize, containerSize, 'F');
            doc.setTextColor(156, 163, 175);
            doc.setFontSize(6);
            doc.text('No Img', imgX + (containerSize / 2), imgYpos + (containerSize / 2), { align: 'center' });
        }

        // Content Text (Right side of image)
        const textX = imgX + containerSize + 5;
        const maxTextW = colWidth - containerSize - 20;

        doc.setTextColor(55, 65, 81);
        doc.setFontSize(9); // 9pt
        doc.setFont('helvetica', 'bold');
        const objLabel = translations['pdf.objective_short'] || 'Objective';
        doc.text(objLabel, textX, imgYpos + 3);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(8); // Ensure size
        // Description with increased line spacing
        const objText = doc.splitTextToSize(post.objective, maxTextW);
        doc.text(objText.slice(0, 2), textX, imgYpos + 8, { lineHeightFactor: 1.5 });

        // Campaign & Ad Group Info (if present)
        let campaignY = imgYpos + 8 + (objText.slice(0, 2).length * 3.5);
        if (post.campaign_name || post.ad_group_name) {
            doc.setFontSize(7);
            doc.setTextColor(107, 114, 128);

            if (post.campaign_name) {
                doc.setFont('helvetica', 'bold');
                doc.text('Campaign:', textX, campaignY);
                doc.setFont('helvetica', 'normal');
                const campaignText = doc.splitTextToSize(post.campaign_name, maxTextW - 20);
                doc.text(campaignText[0], textX + 18, campaignY);
                campaignY += 3;
            }

            if (post.ad_group_name) {
                doc.setFont('helvetica', 'bold');
                doc.text('Ad Set/Group:', textX, campaignY);
                doc.setFont('helvetica', 'normal');
                const adGroupText = doc.splitTextToSize(post.ad_group_name, maxTextW - 22);
                doc.text(adGroupText[0], textX + 22, campaignY);
            }
        }

        // Footer: Status + Budget
        doc.setFontSize(7);
        doc.setTextColor(107, 114, 128);
        const statusY = y + rowHeight - 6;
        const statusStr = `${post.status}${post.isPaid ? ` • Paid $${post.budget}` : ''}`;
        doc.text(statusStr, x + 6, statusY);

        col++;
        if (col >= cols) {
            col = 0;
            y += rowHeight + margin;
        }
    }

    // --- Footer: Branding ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Warp CR - Digital Agency | Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
    }

    doc.save(`SocialPlan_${startDateStr}_${endDateStr}.pdf`);
};
