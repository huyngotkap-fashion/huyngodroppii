import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout,
  Smartphone,
  Monitor,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle as CircleIcon,
  Hexagon as HexagonIcon,
  Download, 
  Trash2, 
  Plus, 
  Layers, 
  Maximize, 
  Palette, 
  Move,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Settings2,
  Undo2,
  Redo2,
  Save,
  FileImage,
  Upload,
  Scissors,
  Baseline,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  ArrowUp,
  ArrowDown,
  Triangle as TriangleIcon,
  Strikethrough,
  Type as TypeIcon,
  Trash,
  RotateCcw,
  Eraser,
  Layers2,
  Check,
  Frame,
  Lock,
  Unlock,
  Menu,
  X,
  Square as SquareIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, IText, FabricImage, Object as FabricObject, Circle, Rect, Polygon, Gradient, Triangle } from 'fabric';

const FONTS = [
  'Inter',
  'Roboto',
  'Playfair Display',
  'Montserrat',
  'Dancing Script',
  'Pacifico',
  'Bungee'
];

const BANNER_TEMPLATES = [
  { id: 'fb-cover', name: 'Facebook Cover', width: 820, height: 312, icon: Facebook, desc: '820 x 312 px' },
  { id: 'ig-post', name: 'Instagram Post', width: 1080, height: 1080, icon: Instagram, desc: '1080 x 1080 px' },
  { id: 'ig-story', name: 'Instagram Story', width: 1080, height: 1920, icon: Smartphone, desc: '1080 x 1920 px' },
  { id: 'yt-banner', name: 'YouTube Banner', width: 2560, height: 1440, icon: Youtube, desc: '2560 x 1440 px' },
  { id: 'li-cover', name: 'LinkedIn Cover', width: 1584, height: 396, icon: Linkedin, desc: '1584 x 396 px' },
  { id: 'tw-header', name: 'Twitter Header', width: 1500, height: 500, icon: Twitter, desc: '1500 x 500 px' },
  { id: 'web-leader', name: 'Leaderboard', width: 728, height: 90, icon: Layout, desc: '728 x 90 px' },
  { id: 'web-rect', name: 'Large Rectangle', width: 336, height: 280, icon: Monitor, desc: '336 x 280 px' },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [activeTab, setActiveTab] = useState<'size' | 'text' | 'image' | 'shapes' | 'layers' | 'frame' | 'banners'>('size');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update Canvas Size and Zoom
  useEffect(() => {
    const updateZoom = () => {
      if (!containerRef.current || !fabricCanvas) return;
      const container = containerRef.current;
      const padding = isMobile ? 40 : 100;
      const availableWidth = container.clientWidth - padding;
      const availableHeight = container.clientHeight - padding;

      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      setZoomScale(scale);
      fabricCanvas.setZoom(scale);
      fabricCanvas.setDimensions({ 
        width: canvasWidth * scale, 
        height: canvasHeight * scale 
      });
      fabricCanvas.renderAll();
    };

    const timer = setTimeout(updateZoom, 100);
    window.addEventListener('resize', updateZoom);
    return () => {
      window.removeEventListener('resize', updateZoom);
      clearTimeout(timer);
    };
  }, [canvasWidth, canvasHeight, isMobile, sidebarOpen, fabricCanvas]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [projectName, setProjectName] = useState<string>('du-an-moi');
  const [showProjectNameModal, setShowProjectNameModal] = useState(false);
  const [tempProjectName, setTempProjectName] = useState('');
  const [refresh, setRefresh] = useState(0);
  const isHistoryAction = useRef(false);
  const [isMaskEditing, setIsMaskEditing] = useState(false);
  const [clipboard, setClipboard] = useState<any>(null);
  const maskProxyRef = useRef<FabricObject | null>(null);
  const editingImageRef = useRef<FabricImage | null>(null);

  const historyRef = useRef<string[]>([]);
  const historyStepRef = useRef(-1);

  const triggerRefresh = () => setRefresh(v => v + 1);

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const applyBannerTemplate = (width: number, height: number) => {
    setCanvasWidth(width);
    setCanvasHeight(height);
    if (fabricCanvas) {
      // We don't clear the canvas, just resize it
      // The useEffect for canvasWidth/Height will handle the zoom and dimensions
      triggerRefresh();
      closeSidebarOnMobile();
    }
  };

  // Save History
  const saveHistory = () => {
    if (!fabricCanvas || isHistoryAction.current) return;
    const json = JSON.stringify(fabricCanvas.toJSON());
    
    // Don't save if it's the same as the current step
    if (historyRef.current[historyStepRef.current] === json) return;

    const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
    newHistory.push(json);
    
    // Limit history to 50 steps
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    historyRef.current = newHistory;
    historyStepRef.current = newHistory.length - 1;
    
    setHistory([...newHistory]);
    setHistoryStep(historyStepRef.current);
  };

  const undo = () => {
    if (historyStepRef.current > 0 && fabricCanvas) {
      isHistoryAction.current = true;
      const prevStep = historyStepRef.current - 1;
      fabricCanvas.loadFromJSON(JSON.parse(historyRef.current[prevStep])).then(() => {
        fabricCanvas.renderAll();
        historyStepRef.current = prevStep;
        setHistoryStep(prevStep);
        isHistoryAction.current = false;
        triggerRefresh();
      });
    }
  };

  const redo = () => {
    if (historyStepRef.current < historyRef.current.length - 1 && fabricCanvas) {
      isHistoryAction.current = true;
      const nextStep = historyStepRef.current + 1;
      fabricCanvas.loadFromJSON(JSON.parse(historyRef.current[nextStep])).then(() => {
        fabricCanvas.renderAll();
        historyStepRef.current = nextStep;
        setHistoryStep(nextStep);
        isHistoryAction.current = false;
        triggerRefresh();
      });
    }
  };

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvas) {
      const canvas = new Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: bgColor,
      });

      canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
      canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
      canvas.on('selection:cleared', () => setSelectedObject(null));

      canvas.on('mouse:dblclick', (e) => {
        const target = e.target || canvas.findTarget(e.e);
        if (target && target instanceof FabricImage && target.clipPath) {
          enterMaskEditMode(target as FabricImage);
        }
      });

      canvas.on('mouse:up', (e) => {
        const activeObject = canvas.getActiveObject();
        // Only trigger if we are dragging an image (no mask) onto another image (with mask)
        if (activeObject && activeObject instanceof FabricImage && !activeObject.clipPath && !isMaskEditing) {
          const pointer = canvas.getScenePoint(e.e);
          const objects = canvas.getObjects();
          
          // Find if we dropped onto a masked image
          // We look for any masked image that contains the pointer, excluding the one we're dragging
          for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (obj !== activeObject && obj instanceof FabricImage && obj.clipPath) {
              // Use a slightly more robust check for containment
              if (obj.containsPoint(pointer)) {
                const targetMaskedImage = obj as FabricImage;
                const newSourceImage = activeObject as FabricImage;
                
                // Replace source
                const newSrc = newSourceImage.getSrc();
                targetMaskedImage.setSrc(newSrc).then(() => {
                  const element = targetMaskedImage.getElement();
                  if (element) {
                    targetMaskedImage.set({
                      width: element.width,
                      height: element.height
                    });
                  }
                  
                  targetMaskedImage.setCoords();
                  canvas.remove(newSourceImage);
                  canvas.discardActiveObject();
                  canvas.setActiveObject(targetMaskedImage);
                  canvas.renderAll();
                  saveHistory();
                  triggerRefresh();
                });
                break;
              }
            }
          }
        }
      });

      // History listeners
      const handleHistorySave = () => {
        if (!canvas || isHistoryAction.current) return;
        const json = JSON.stringify(canvas.toJSON());
        
        if (historyRef.current[historyStepRef.current] === json) return;

        const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
        newHistory.push(json);
        
        if (newHistory.length > 50) newHistory.shift();
        
        historyRef.current = newHistory;
        historyStepRef.current = newHistory.length - 1;
        
        setHistory([...newHistory]);
        setHistoryStep(historyStepRef.current);
      };

      canvas.on('object:added', handleHistorySave);
      canvas.on('object:modified', handleHistorySave);
      canvas.on('object:removed', handleHistorySave);
      canvas.on('object:skewing', handleHistorySave);
      canvas.on('object:rotating', handleHistorySave);
      canvas.on('object:scaling', (e: any) => {
        const obj = e.target;
        if (obj instanceof Rect) {
          const anyObj = obj as any;
          if (anyObj.baseRx !== undefined || anyObj.baseRy !== undefined) {
            // Keep corner radius visually consistent during scaling
            obj.set({
              rx: (anyObj.baseRx || 0) / obj.scaleX,
              ry: (anyObj.baseRy || 0) / obj.scaleY
            });
          }
        }
        handleHistorySave();
      });

      setFabricCanvas(canvas);
      
      // Initial history save
      const initialJson = JSON.stringify(canvas.toJSON());
      historyRef.current = [initialJson];
      historyStepRef.current = 0;
      setHistory([initialJson]);
      setHistoryStep(0);

      return () => {
        canvas.dispose();
      };
    }
  }, []);

  // Update Background Color
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.set('backgroundColor', bgColor);
      fabricCanvas.renderAll();
    }
  }, [bgColor, fabricCanvas]);

  // Add Text
  const addText = () => {
    if (fabricCanvas) {
      const text = new IText('Nhập văn bản...', {
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        fontFamily: 'Inter',
        fontSize: 40,
        fill: '#000000',
        originX: 'center',
        originY: 'center',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      closeSidebarOnMobile();
    }
  };

  // Add Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        FabricImage.fromURL(data).then((img) => {
          img.scaleToWidth(200);
          img.set({
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: 'center',
            originY: 'center',
          });
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          closeSidebarOnMobile();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Shapes
  const addShape = (type: 'rect' | 'circle' | 'hexagon') => {
    if (!fabricCanvas) return;
    let shape: FabricObject;
    const common = {
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      fill: '#6366f1',
      originX: 'center' as const,
      originY: 'center' as const,
      strokeUniform: true,
      rx: 0,
      ry: 0,
      baseRx: 0,
      baseRy: 0,
    } as any;

    if (type === 'rect') {
      shape = new Rect({ ...common, width: 100, height: 100 });
    } else if (type === 'circle') {
      shape = new Circle({ ...common, radius: 50 });
    } else {
      const points = [
        { x: 50, y: 0 }, { x: 100, y: 25 }, { x: 100, y: 75 },
        { x: 50, y: 100 }, { x: 0, y: 75 }, { x: 0, y: 25 }
      ];
      shape = new Polygon(points, { ...common });
    }
    fabricCanvas.add(shape);
    fabricCanvas.setActiveObject(shape);
    closeSidebarOnMobile();
  };

  // Apply Mask
  const applyMask = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length !== 2) {
      alert("Vui lòng chọn 1 ảnh và 1 hình dạng để tạo mask (Giữ Shift để chọn nhiều)");
      return;
    }

    const img = activeObjects.find(obj => obj instanceof FabricImage) as FabricImage;
    const mask = activeObjects.find(obj => !(obj instanceof FabricImage));

    if (img && mask) {
      mask.clone().then((clonedMask) => {
        // Calculate relative position and scale considering image scale
        // In Fabric v6, with absolutePositioned: false, coordinates are relative to object center
        const relLeft = (mask.left - img.left) / img.scaleX;
        const relTop = (mask.top - img.top) / img.scaleY;
        const relScaleX = mask.scaleX / img.scaleX;
        const relScaleY = mask.scaleY / img.scaleY;

        clonedMask.set({
          left: relLeft,
          top: relTop,
          scaleX: relScaleX,
          scaleY: relScaleY,
          originX: 'center',
          originY: 'center',
          absolutePositioned: false,
          strokeUniform: true,
        });
        
        img.set({ clipPath: clonedMask });
        fabricCanvas.remove(mask);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        saveHistory();
        closeSidebarOnMobile();
        
        // Force UI update to show mask controls
        setSelectedObject(null);
        setTimeout(() => setSelectedObject(img), 10);
      });
    }
  };

  // Remove Mask
  const removeMask = () => {
    if (fabricCanvas && selectedObject && selectedObject.clipPath) {
      const mask = selectedObject.clipPath;
      mask.clone().then((cloned) => {
        cloned.set({
          left: selectedObject.left + (mask.left * selectedObject.scaleX),
          top: selectedObject.top + (mask.top * selectedObject.scaleY),
          scaleX: mask.scaleX * selectedObject.scaleX,
          scaleY: mask.scaleY * selectedObject.scaleY,
          absolutePositioned: true,
        });
        selectedObject.set({ clipPath: undefined });
        fabricCanvas.add(cloned);
        fabricCanvas.renderAll();
        saveHistory();
        triggerRefresh();
      });
    }
  };

  // Mask Edit Mode Logic
  const enterMaskEditMode = (img: FabricImage) => {
    if (!img.clipPath || !fabricCanvas || isMaskEditing) return;
    
    setActiveTab('layers');
    setIsMaskEditing(true);
    editingImageRef.current = img;
    const mask = img.clipPath;
    
    // Make mask absolute for editing
    const absoluteLeft = img.left + (mask.left * img.scaleX);
    const absoluteTop = img.top + (mask.top * img.scaleY);
    const absoluteScaleX = mask.scaleX * img.scaleX;
    const absoluteScaleY = mask.scaleY * img.scaleY;
    const absoluteAngle = mask.angle + img.angle;

    mask.set({
      absolutePositioned: true,
      left: absoluteLeft,
      top: absoluteTop,
      scaleX: absoluteScaleX,
      scaleY: absoluteScaleY,
      angle: absoluteAngle,
      strokeUniform: true,
    });

    mask.clone().then((proxy) => {
      proxy.set({
        opacity: 0.4,
        stroke: '#6366f1',
        strokeWidth: 2,
        fill: 'transparent',
        selectable: false,
        evented: false,
        strokeUniform: true,
      });
      
      fabricCanvas.add(proxy);
      maskProxyRef.current = proxy;
      
      // Select the image so user can scale/move it behind the mask
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
    });
  };

  const exitMaskEditMode = () => {
    if (fabricCanvas && editingImageRef.current) {
      const img = editingImageRef.current;
      const mask = img.clipPath;
      
      if (mask) {
        // Convert back to relative
        mask.set({
          left: (mask.left - img.left) / img.scaleX,
          top: (mask.top - img.top) / img.scaleY,
          scaleX: mask.scaleX / img.scaleX,
          scaleY: mask.scaleY / img.scaleY,
          angle: mask.angle - img.angle,
          absolutePositioned: false,
        });
      }

      if (maskProxyRef.current) {
        fabricCanvas.remove(maskProxyRef.current);
        maskProxyRef.current = null;
      }
      
      editingImageRef.current = null;
      setIsMaskEditing(false);
      saveHistory();
      fabricCanvas.renderAll();
    }
  };

  // Replace Masked Image
  const replaceMaskedImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas && selectedObject && selectedObject instanceof FabricImage && selectedObject.clipPath) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        const img = selectedObject as FabricImage;
        img.setSrc(data).then(() => {
          const element = img.getElement();
          if (element) {
            img.set({
              width: element.width,
              height: element.height
            });
          }
          img.setCoords();
          fabricCanvas.renderAll();
          saveHistory();
          triggerRefresh();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Frame
  const addFrame = (type: 'default' | 'canvas' = 'default') => {
    if (fabricCanvas) {
      const isCanvas = type === 'canvas';
      const frame = new Rect({
        left: isCanvas ? 0 : canvasWidth / 4,
        top: isCanvas ? 0 : canvasHeight / 4,
        width: isCanvas ? canvasWidth : canvasWidth / 2,
        height: isCanvas ? canvasHeight : canvasHeight / 2,
        fill: 'transparent',
        stroke: '#6366f1',
        strokeWidth: isCanvas ? 20 : 8,
        rx: isCanvas ? 0 : 20,
        ry: isCanvas ? 0 : 20,
        baseRx: isCanvas ? 0 : 20,
        baseRy: isCanvas ? 0 : 20,
        strokeUniform: true,
        cornerColor: '#6366f1',
        cornerStyle: 'circle',
        transparentCorners: false,
        selectable: true,
        evented: true,
      } as any);
      fabricCanvas.add(frame);
      if (isCanvas) {
        fabricCanvas.sendObjectToBack(frame);
      }
      fabricCanvas.setActiveObject(frame);
      fabricCanvas.renderAll();
      saveHistory();
      closeSidebarOnMobile();
    }
  };

  const applyGradient = (type: 'linear' | 'radial', color1: string, color2: string) => {
    if (selectedObject && fabricCanvas) {
      const width = selectedObject.width || 100;
      const height = selectedObject.height || 100;
      
      const gradient = new Gradient({
        type: type,
        coords: type === 'linear' 
          ? { x1: 0, y1: 0, x2: width, y2: 0 } 
          : { r1: 0, r2: Math.max(width, height) / 2, x1: width / 2, y1: height / 2, x2: width / 2, y2: height / 2 },
        colorStops: [
          { offset: 0, color: color1 },
          { offset: 1, color: color2 }
        ]
      });
      
      selectedObject.set('fill', gradient);
      fabricCanvas.requestRenderAll();
      saveHistory();
      triggerRefresh();
    }
  };

  // Delete Selected
  const deleteSelected = () => {
    if (fabricCanvas && selectedObject) {
      fabricCanvas.remove(selectedObject);
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  };

  // Export
  const exportImage = (multiplier: number = 1) => {
    if (fabricCanvas) {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: multiplier,
      });
      const link = document.createElement('a');
      link.download = `thiet-ke-${multiplier}x.png`;
      link.href = dataURL;
      link.click();
      closeSidebarOnMobile();
    }
  };

  // Save Project
  const saveProject = () => {
    if (!projectName || projectName === 'du-an-moi') {
      setTempProjectName(projectName);
      setShowProjectNameModal(true);
      return;
    }
    if (fabricCanvas) {
      const json = fabricCanvas.toJSON();
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = `${projectName}.json`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  };

  const confirmProjectName = () => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());
      setShowProjectNameModal(false);
      
      // Trigger save after setting name
      if (fabricCanvas) {
        const json = fabricCanvas.toJSON();
        const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `${tempProjectName.trim()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
      }
    }
  };

  // Load Project
  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas) {
      // Set project name from filename (remove extension)
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setProjectName(fileName);

      const reader = new FileReader();
      reader.onload = (f) => {
        try {
          const json = JSON.parse(f.target?.result as string);
          fabricCanvas.loadFromJSON(json).then(() => {
            fabricCanvas.renderAll();
            saveHistory();
          });
        } catch (error) {
          console.error("Error loading project:", error);
          alert("Không thể mở dự án. File không hợp lệ.");
        }
      };
      reader.readAsText(file);
    }
  };

  // Duplication
  const duplicateSelected = () => {
    if (fabricCanvas && selectedObject) {
      selectedObject.clone().then((cloned) => {
        cloned.set({
          left: selectedObject.left + 20,
          top: selectedObject.top + 20,
        });
        fabricCanvas.add(cloned);
        fabricCanvas.setActiveObject(cloned);
        fabricCanvas.renderAll();
      });
    }
  };

  // Copy/Paste
  const copySelected = () => {
    if (fabricCanvas && selectedObject) {
      selectedObject.clone().then((cloned) => {
        setClipboard(cloned);
      });
    }
  };

  const pasteSelected = () => {
    if (fabricCanvas && clipboard) {
      clipboard.clone().then((cloned: any) => {
        fabricCanvas.discardActiveObject();
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
          evented: true,
        });
        fabricCanvas.add(cloned);
        fabricCanvas.setActiveObject(cloned);
        fabricCanvas.requestRenderAll();
        saveHistory();
      });
    }
  };

  // Floating Toolbar Position
  const [toolbarPos, setToolbarPos] = useState<{ x: number, y: number } | null>(null);
  const [isMaskPair, setIsMaskPair] = useState(false);
  const [isMaskedObject, setIsMaskedObject] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    if (!fabricCanvas) return;

    const updateToolbarPos = () => {
      const activeObjects = fabricCanvas.getActiveObjects();
      const activeObject = fabricCanvas.getActiveObject();
      
      if (activeObject && !isMaskEditing) {
        const boundingRect = activeObject.getBoundingRect();
        const canvasHeight = fabricCanvas.getHeight();
        
        // Calculate Y position
        let yPos = boundingRect.top - 50;
        
        // If too close to top, try showing below
        if (yPos < 10) {
          yPos = boundingRect.top + boundingRect.height + 10;
        }

        // If still off-screen (below the canvas), or if the object is huge
        // just stick it to a reasonable position near the top of the object but visible
        if (yPos > canvasHeight - 50 || boundingRect.height > canvasHeight * 0.8) {
          yPos = Math.max(20, boundingRect.top + 20);
        }

        setToolbarPos({
          x: boundingRect.left + boundingRect.width / 2,
          y: yPos
        });

        // Check if it's a mask pair (1 image + 1 shape)
        if (activeObjects.length === 2) {
          const hasImage = activeObjects.some(obj => obj instanceof FabricImage && !obj.clipPath);
          const hasShape = activeObjects.some(obj => !(obj instanceof FabricImage));
          setIsMaskPair(hasImage && hasShape);
          setIsMaskedObject(false);
        } else if (activeObjects.length === 1) {
          setIsMaskPair(false);
          setIsMaskedObject(activeObject instanceof FabricImage && !!activeObject.clipPath);
        } else {
          setIsMaskPair(false);
          setIsMaskedObject(false);
        }

        // Check if locked
        setIsLocked(!!activeObject.lockMovementX);
      } else {
        setToolbarPos(null);
        setIsMaskPair(false);
        setIsMaskedObject(false);
        setIsLocked(false);
      }
    };

    fabricCanvas.on('selection:created', updateToolbarPos);
    fabricCanvas.on('selection:updated', updateToolbarPos);
    fabricCanvas.on('selection:cleared', updateToolbarPos);
    fabricCanvas.on('object:moving', updateToolbarPos);
    fabricCanvas.on('object:scaling', updateToolbarPos);
    fabricCanvas.on('object:rotating', updateToolbarPos);

    return () => {
      fabricCanvas.off('selection:created', updateToolbarPos);
      fabricCanvas.off('selection:updated', updateToolbarPos);
      fabricCanvas.off('selection:cleared', updateToolbarPos);
      fabricCanvas.off('object:moving', updateToolbarPos);
      fabricCanvas.off('object:scaling', updateToolbarPos);
      fabricCanvas.off('object:rotating', updateToolbarPos);
    };
  }, [fabricCanvas, isMaskEditing]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or text object is being edited
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (fabricCanvas?.getActiveObject() instanceof IText && (fabricCanvas.getActiveObject() as IText).isEditing) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (isCtrl && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if (isCtrl && e.key === 'c') {
        copySelected();
      } else if (isCtrl && e.key === 'v') {
        duplicateSelected();
      } else if (isCtrl && e.key === 's') {
        e.preventDefault();
        saveProject();
      } else if (isCtrl && e.key === 'l') {
        e.preventDefault();
        const active = fabricCanvas?.getActiveObject();
        if (active) {
          const newLock = !active.lockMovementX;
          updateObjectProperty('lock', newLock);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, historyStep, history]);

  // Layering
  const bringForward = () => {
    if (fabricCanvas && selectedObject) {
      fabricCanvas.bringObjectForward(selectedObject);
      fabricCanvas.renderAll();
      saveHistory();
      triggerRefresh();
    }
  };

  const sendBackwards = () => {
    if (fabricCanvas && selectedObject) {
      fabricCanvas.sendObjectBackwards(selectedObject);
      fabricCanvas.renderAll();
      saveHistory();
      triggerRefresh();
    }
  };

  const bringToFront = () => {
    if (fabricCanvas && selectedObject) {
      fabricCanvas.bringObjectToFront(selectedObject);
      fabricCanvas.renderAll();
      saveHistory();
    }
  };

  // Send to Back
  const sendToBack = () => {
    if (fabricCanvas && selectedObject) {
      fabricCanvas.sendObjectToBack(selectedObject);
      fabricCanvas.renderAll();
      saveHistory();
    }
  };

  // Clear Canvas
  const clearCanvas = () => {
    if (fabricCanvas && window.confirm('Bạn có chắc chắn muốn xóa toàn bộ thiết kế?')) {
      fabricCanvas.clear();
      fabricCanvas.set('backgroundColor', bgColor);
      fabricCanvas.renderAll();
      saveHistory();
    }
  };

  // Update Object Property
  const updateObjectProperty = (property: string, value: any) => {
    if (selectedObject && fabricCanvas) {
      if (property.startsWith('clipPath.')) {
        const clipProp = property.split('.')[1];
        if (selectedObject.clipPath) {
          selectedObject.clipPath.set(clipProp as any, value);
          selectedObject.clipPath.setCoords();
          selectedObject.dirty = true;
        }
      } else if (property === 'lock') {
        selectedObject.set({
          lockMovementX: value,
          lockMovementY: value,
          lockScalingX: value,
          lockScalingY: value,
          lockRotation: value,
          hasControls: !value,
        });
        setIsLocked(value);
      } else if (selectedObject instanceof IText) {
        if (property === 'fontWeight') {
          const newValue = selectedObject.fontWeight === 'bold' ? 'normal' : 'bold';
          selectedObject.set('fontWeight', newValue);
        } else if (property === 'fontStyle') {
          const newValue = selectedObject.fontStyle === 'italic' ? 'normal' : 'italic';
          selectedObject.set('fontStyle', newValue);
        } else if (property === 'underline') {
          selectedObject.set('underline', !selectedObject.underline);
        } else if (property === 'linethrough') {
          selectedObject.set('linethrough', !selectedObject.linethrough);
        } else if (property === 'rx' || property === 'ry') {
          selectedObject.set(property as any, value);
          (selectedObject as any)[`base${property.charAt(0).toUpperCase()}${property.slice(1)}`] = value;
        } else {
          selectedObject.set(property as any, value);
        }
      } else {
        selectedObject.set(property as any, value);
      }
      fabricCanvas.requestRenderAll();
      saveHistory();
      triggerRefresh();
    }
  };

  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Pinch to Zoom state
  const touchState = useRef({
    initialDistance: 0,
    initialZoom: 1,
    initialObjectScaleX: 1,
    initialObjectScaleY: 1,
    isPinching: false
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      const activeObject = fabricCanvas?.getActiveObject();
      
      touchState.current = {
        initialDistance: dist,
        initialZoom: zoomScale,
        initialObjectScaleX: activeObject?.scaleX || 1,
        initialObjectScaleY: activeObject?.scaleY || 1,
        isPinching: true
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchState.current.isPinching && e.touches.length === 2 && fabricCanvas) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const scaleFactor = dist / touchState.current.initialDistance;
      
      const activeObject = fabricCanvas.getActiveObject();
      
      if (activeObject) {
        // Scale the selected object
        activeObject.set({
          scaleX: touchState.current.initialObjectScaleX * scaleFactor,
          scaleY: touchState.current.initialObjectScaleY * scaleFactor
        });
        activeObject.setCoords();
        fabricCanvas.renderAll();
      } else {
        // Zoom the canvas
        const newZoom = Math.min(Math.max(touchState.current.initialZoom * scaleFactor, 0.1), 4);
        setZoomScale(newZoom);
        fabricCanvas.setZoom(newZoom);
        fabricCanvas.setDimensions({ 
          width: canvasWidth * newZoom, 
          height: canvasHeight * newZoom 
        });
        fabricCanvas.renderAll();
      }
    }
  };

  const handleTouchEnd = () => {
    touchState.current.isPinching = false;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0f0f12] text-white font-sans overflow-hidden">
      {/* Sidebar - Desktop: fixed left, Mobile: Bottom Sheet (Canva-style) */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || !isMobile) && (
          <motion.aside 
            initial={isMobile ? { y: '100%' } : { width: 0 }}
            animate={isMobile ? { y: 0 } : { width: 320 }}
            exit={isMobile ? { y: '100%' } : { width: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`${isMobile ? 'fixed inset-x-0 bottom-0 h-[60vh] rounded-t-[32px] z-[80]' : 'relative h-full border-r'} bg-[#1a1a1e] border-white/5 flex flex-col shadow-2xl overflow-hidden`}
          >
            {/* Mobile Handle */}
            {isMobile && (
              <div className="flex justify-center p-4 cursor-pointer group" onClick={() => setSidebarOpen(false)}>
                <div className="w-12 h-1.5 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors" />
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4 md:py-6 space-y-6">
              {/* Desktop Tabs */}
              {!isMobile && (
                <div className="flex bg-black/20 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
                  {(['size', 'banners', 'text', 'image', 'shapes', 'frame', 'layers'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
                        activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {tab === 'size' && 'Cỡ'}
                      {tab === 'banners' && 'Banner'}
                      {tab === 'text' && 'Chữ'}
                      {tab === 'image' && 'Ảnh'}
                      {tab === 'shapes' && 'Hình'}
                      {tab === 'frame' && 'Khung'}
                      {tab === 'layers' && 'Lớp'}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab Content Header for Mobile */}
              {isMobile && (
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-white capitalize">
                    {activeTab === 'size' && 'Kích thước & Nền'}
                    {activeTab === 'banners' && 'Mẫu Banner'}
                    {activeTab === 'text' && 'Văn bản'}
                    {activeTab === 'image' && 'Hình ảnh'}
                    {activeTab === 'shapes' && 'Hình khối'}
                    {activeTab === 'frame' && 'Khung hình'}
                    {activeTab === 'layers' && 'Lớp đối tượng'}
                  </h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 bg-white/5 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

          <div className="space-y-6 overflow-hidden">
            {activeTab === 'banners' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Chọn mẫu kích thước</p>
                <div className="grid grid-cols-1 gap-3">
                  {BANNER_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyBannerTemplate(template.width, template.height)}
                      className="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-indigo-600/20 border border-white/5 rounded-2xl transition-all group text-left"
                    >
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <template.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{template.name}</p>
                        <p className="text-[10px] text-zinc-500">{template.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'size' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-4">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Mẫu Banner nhanh</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BANNER_TEMPLATES.slice(0, 4).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyBannerTemplate(template.width, template.height)}
                        className="p-2 bg-zinc-900 hover:bg-indigo-600/30 border border-white/5 rounded-xl transition-all text-left"
                      >
                        <p className="text-[10px] font-bold text-white truncate">{template.name}</p>
                        <p className="text-[8px] text-zinc-500">{template.desc}</p>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('banners')}
                    className="w-full mt-3 py-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-1"
                  >
                    Xem tất cả mẫu <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chiều rộng (px)</label>
                  <input 
                    type="number" 
                    value={canvasWidth} 
                    onChange={(e) => setCanvasWidth(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chiều cao (px)</label>
                  <input 
                    type="number" 
                    value={canvasHeight} 
                    onChange={(e) => setCanvasHeight(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Thu phóng ({Math.round(zoomScale * 100)}%)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" min="0.1" max="2" step="0.01"
                      value={zoomScale}
                      onChange={(e) => {
                        const scale = Number(e.target.value);
                        setZoomScale(scale);
                        if (fabricCanvas) {
                          fabricCanvas.setZoom(scale);
                          fabricCanvas.setDimensions({ 
                            width: canvasWidth * scale, 
                            height: canvasHeight * scale 
                          });
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="flex-1 accent-indigo-600"
                    />
                    <button 
                      onClick={() => {
                        if (containerRef.current && fabricCanvas) {
                          const container = containerRef.current;
                          const padding = isMobile ? 40 : 100;
                          const availableWidth = container.clientWidth - padding;
                          const availableHeight = container.clientHeight - padding;
                          const scaleX = availableWidth / canvasWidth;
                          const scaleY = availableHeight / canvasHeight;
                          const scale = Math.min(scaleX, scaleY, 1);
                          setZoomScale(scale);
                          fabricCanvas.setZoom(scale);
                          fabricCanvas.setDimensions({ 
                            width: canvasWidth * scale, 
                            height: canvasHeight * scale 
                          });
                          fabricCanvas.renderAll();
                        }
                      }}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold"
                    >
                      Vừa khít
                    </button>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Màu nền</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#ffffff', '#000000', '#f3f4f6', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${bgColor === color ? 'border-indigo-500 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'text' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <button 
                  onClick={addText}
                  className="w-full py-6 border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <Type className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Thêm văn bản mới</span>
                </button>

                {selectedObject instanceof IText && (
                  <div className="p-4 bg-black/20 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kiểu chữ</label>
                      <select 
                        onChange={(e) => updateObjectProperty('fontFamily', e.target.value)}
                        value={selectedObject.fontFamily}
                        className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none"
                      >
                        {FONTS.map(font => <option key={font} value={font}>{font}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => updateObjectProperty('fontWeight', null)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${selectedObject.fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateObjectProperty('fontStyle', null)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${selectedObject.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateObjectProperty('underline', null)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${selectedObject.underline ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateObjectProperty('linethrough', null)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${selectedObject.linethrough ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => updateObjectProperty('textAlign', 'left')}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${selectedObject.textAlign === 'left' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateObjectProperty('textAlign', 'center')}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${selectedObject.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateObjectProperty('textAlign', 'right')}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors ${selectedObject.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Màu sắc</label>
                      <input 
                        type="color" 
                        value={selectedObject.fill as string}
                        onChange={(e) => updateObjectProperty('fill', e.target.value)}
                        className="w-full h-8 rounded-lg bg-transparent border-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cỡ chữ</label>
                        <span className="text-[10px] text-zinc-400">{selectedObject.fontSize}px</span>
                      </div>
                      <input 
                        type="range" min="10" max="200"
                        value={selectedObject.fontSize}
                        onChange={(e) => updateObjectProperty('fontSize', Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Khoảng cách dòng</label>
                        <span className="text-[10px] text-zinc-400">{selectedObject.lineHeight}</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="3" step="0.1"
                        value={selectedObject.lineHeight}
                        onChange={(e) => updateObjectProperty('lineHeight', Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Khoảng cách chữ</label>
                        <span className="text-[10px] text-zinc-400">{selectedObject.charSpacing}</span>
                      </div>
                      <input 
                        type="range" min="-100" max="1000" step="10"
                        value={selectedObject.charSpacing}
                        onChange={(e) => updateObjectProperty('charSpacing', Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Độ dày viền</label>
                        <span className="text-[10px] text-zinc-400">{selectedObject.strokeWidth}px</span>
                      </div>
                      <input 
                        type="range" min="0" max="20" step="1"
                        value={selectedObject.strokeWidth}
                        onChange={(e) => updateObjectProperty('strokeWidth', Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                    {selectedObject.strokeWidth > 0 && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Màu viền</label>
                        <input 
                          type="color" 
                          value={selectedObject.stroke as string}
                          onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                          className="w-full h-8 rounded-lg bg-transparent border-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'image' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <label className="w-full py-6 border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Tải ảnh lên</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>

                <button 
                  onClick={applyMask}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Scissors className="w-4 h-4" />
                  Tạo Mask (Chọn Ảnh + Hình)
                </button>
              </motion.div>
            )}

            {activeTab === 'shapes' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => addShape('rect')}
                  className="p-4 bg-zinc-900 hover:bg-indigo-600/20 border border-white/5 rounded-2xl flex flex-col items-center gap-2 transition-all"
                >
                  <Square className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Hình vuông</span>
                </button>
                <button 
                  onClick={() => addShape('circle')}
                  className="p-4 bg-zinc-900 hover:bg-indigo-600/20 border border-white/5 rounded-2xl flex flex-col items-center gap-2 transition-all"
                >
                  <CircleIcon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Hình tròn</span>
                </button>
                <button 
                  onClick={() => addShape('hexagon')}
                  className="p-4 bg-zinc-900 hover:bg-indigo-600/20 border border-white/5 rounded-2xl flex flex-col items-center gap-2 transition-all"
                >
                  <HexagonIcon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Lục giác</span>
                </button>
              </motion.div>
            )}

            {activeTab === 'frame' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => addFrame('default')}
                    className="p-4 bg-zinc-900 hover:bg-indigo-600/20 border border-white/5 rounded-2xl flex flex-col items-center gap-2 transition-all group"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <Frame className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium">Khung tự do</span>
                  </button>
                  <button 
                    onClick={() => addFrame('canvas')}
                    className="p-4 bg-zinc-900 hover:bg-indigo-600/20 border border-white/5 rounded-2xl flex flex-col items-center gap-2 transition-all group"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <Maximize className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium">Khung viền Canvas</span>
                  </button>
                </div>

                {selectedObject instanceof Rect && (
                  <div className="space-y-6">
                    <div className="p-4 bg-black/20 rounded-2xl space-y-4">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tùy chỉnh khung</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bo góc</label>
                          <span className="text-[10px] text-zinc-400">{selectedObject.rx}px</span>
                        </div>
                        <input 
                          type="range" min="0" max="200" step="1"
                          value={selectedObject.rx}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateObjectProperty('rx', val);
                            updateObjectProperty('ry', val);
                          }}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Độ dày viền</label>
                          <span className="text-[10px] text-zinc-400">{selectedObject.strokeWidth}px</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" step="1"
                          value={selectedObject.strokeWidth}
                          onChange={(e) => updateObjectProperty('strokeWidth', Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kiểu viền</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => updateObjectProperty('strokeDashArray', null)}
                            className={`py-2 rounded-lg border border-white/10 text-[10px] ${!selectedObject.strokeDashArray ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                          >
                            Liền
                          </button>
                          <button 
                            onClick={() => updateObjectProperty('strokeDashArray', [10, 5])}
                            className={`py-2 rounded-lg border border-white/10 text-[10px] ${JSON.stringify(selectedObject.strokeDashArray) === '[10,5]' ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                          >
                            Đứt đoạn
                          </button>
                          <button 
                            onClick={() => updateObjectProperty('strokeDashArray', [2, 2])}
                            className={`py-2 rounded-lg border border-white/10 text-[10px] ${JSON.stringify(selectedObject.strokeDashArray) === '[2,2]' ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                          >
                            Chấm
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Màu viền</label>
                        <input 
                          type="color" 
                          value={selectedObject.stroke as string}
                          onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                          className="w-full h-8 rounded-lg bg-transparent border-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-black/20 rounded-2xl space-y-4">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Màu nền & Gradient</p>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Màu đơn</label>
                        <div className="flex gap-2 flex-wrap">
                          {['transparent', '#ffffff', '#000000', '#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'].map((color) => (
                            <button
                              key={color}
                              onClick={() => updateObjectProperty('fill', color)}
                              className={`w-6 h-6 rounded-md border border-white/10 ${selectedObject.fill === color ? 'ring-2 ring-indigo-500' : ''}`}
                              style={{ backgroundColor: color === 'transparent' ? 'white' : color, backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none', backgroundSize: color === 'transparent' ? '8px 8px' : 'auto', backgroundPosition: color === 'transparent' ? '0 0, 4px 4px' : '0 0' }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gradient mẫu</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => applyGradient('linear', '#6366f1', '#a855f7')}
                            className="h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 border border-white/10"
                          />
                          <button 
                            onClick={() => applyGradient('linear', '#f43f5e', '#fb923c')}
                            className="h-8 rounded-lg bg-gradient-to-r from-rose-500 to-orange-400 border border-white/10"
                          />
                          <button 
                            onClick={() => applyGradient('linear', '#10b981', '#3b82f6')}
                            className="h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 border border-white/10"
                          />
                          <button 
                            onClick={() => applyGradient('linear', '#f59e0b', '#ef4444')}
                            className="h-8 rounded-lg bg-gradient-to-r from-amber-500 to-red-500 border border-white/10"
                          />
                          <button 
                            onClick={() => applyGradient('radial', '#ffffff', '#000000')}
                            className="h-8 rounded-lg bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-white to-black border border-white/10"
                          />
                          <button 
                            onClick={() => applyGradient('radial', '#6366f1', '#1e1b4b')}
                            className="h-8 rounded-lg bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-indigo-500 to-indigo-950 border border-white/10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'layers' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {selectedObject ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-800/50 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Trạng thái lớp</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={copySelected}
                            className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white rounded-lg transition-colors"
                            title="Sao chép"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={pasteSelected}
                            className={`p-2 rounded-lg transition-colors ${clipboard ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}
                            disabled={!clipboard}
                            title="Dán"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateObjectProperty('lock', !selectedObject.lockMovementX)}
                            className={`p-2 rounded-lg transition-colors ${selectedObject.lockMovementX ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:text-white'}`}
                            title={selectedObject.lockMovementX ? "Mở khóa" : "Khóa lớp"}
                          >
                            {selectedObject.lockMovementX ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={duplicateSelected}
                            className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-white rounded-lg transition-colors"
                            title="Nhân bản"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedObject.clipPath && (
                      <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Điều chỉnh Mask</p>
                          <Scissors className="w-3 h-3 text-indigo-400" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kích thước khung</label>
                            <span className="text-[10px] text-zinc-400">{Math.round((selectedObject.clipPath.scaleX || 1) * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0.01" max="10" step="0.05"
                            value={selectedObject.clipPath.scaleX}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              updateObjectProperty('clipPath.scaleX', val);
                              updateObjectProperty('clipPath.scaleY', val);
                            }}
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Vị trí X (Ngang)</label>
                            <span className="text-[10px] text-zinc-400">{Math.round(selectedObject.clipPath.left || 0)}</span>
                          </div>
                          <input 
                            type="range" min="-2000" max="2000" step="1"
                            value={selectedObject.clipPath.left}
                            onChange={(e) => updateObjectProperty('clipPath.left', Number(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Vị trí Y (Dọc)</label>
                            <span className="text-[10px] text-zinc-400">{Math.round(selectedObject.clipPath.top || 0)}</span>
                          </div>
                          <input 
                            type="range" min="-2000" max="2000" step="1"
                            value={selectedObject.clipPath.top}
                            onChange={(e) => updateObjectProperty('clipPath.top', Number(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                        </div>

                        <div className="pt-2 grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => {
                              if (selectedObject instanceof FabricImage) {
                                enterMaskEditMode(selectedObject as FabricImage);
                              }
                            }}
                            className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Scissors className="w-3 h-3" />
                            Chỉnh sửa Mask
                          </button>
                          <button 
                            onClick={removeMask}
                            className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl text-[10px] font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
                          >
                            <Eraser className="w-3 h-3" />
                            Gỡ bỏ Mask
                          </button>
                        </div>
                        <div className="pt-1">
                          <label className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-[10px] font-bold transition-all border border-white/5 flex items-center justify-center gap-2 cursor-pointer">
                            <Upload className="w-3 h-3" />
                            Thay thế ảnh mới
                            <input type="file" className="hidden" accept="image/*" onChange={replaceMaskedImage} />
                          </label>
                        </div>
                      </div>
                    )}

                    {isMaskEditing && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-amber-500">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Đang chỉnh sửa Mask</p>
                        </div>
                        <p className="text-[10px] text-zinc-400">Bạn có thể di chuyển, phóng to khung Mask trực tiếp trên màn hình.</p>
                        <button 
                          onClick={exitMaskEditMode}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-3 h-3" />
                          Hoàn tất chỉnh sửa
                        </button>
                      </div>
                    )}

                    <div className="p-4 bg-black/20 rounded-2xl space-y-4">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Thuộc tính chung</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Trạng thái</label>
                          <span className="text-[10px] text-zinc-400">{isLocked ? 'Đã khóa' : 'Tự do'}</span>
                        </div>
                        <button 
                          onClick={() => updateObjectProperty('lock', !isLocked)}
                          className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 border ${
                            isLocked 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                              : 'bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {isLocked ? 'Mở khóa đối tượng' : 'Khóa đối tượng'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Độ mờ</label>
                          <span className="text-[10px] text-zinc-400">{Math.round((selectedObject.opacity || 1) * 100)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01"
                          value={selectedObject.opacity}
                          onChange={(e) => updateObjectProperty('opacity', Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Xoay</label>
                          <span className="text-[10px] text-zinc-400">{Math.round(selectedObject.angle || 0)}°</span>
                        </div>
                        <input 
                          type="range" min="0" max="360"
                          value={selectedObject.angle}
                          onChange={(e) => updateObjectProperty('angle', Number(e.target.value))}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      {!(selectedObject instanceof IText) && (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Màu sắc</label>
                            <input 
                              type="color" 
                              value={selectedObject.fill as string}
                              onChange={(e) => updateObjectProperty('fill', e.target.value)}
                              className="w-full h-8 rounded-lg bg-transparent border-none cursor-pointer"
                            />
                          </div>
                          
                          {selectedObject instanceof Rect && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Bo góc</label>
                                <span className="text-[10px] text-zinc-400">{selectedObject.rx}px</span>
                              </div>
                              <input 
                                type="range" min="0" max="100" step="1"
                                value={selectedObject.rx}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  updateObjectProperty('rx', val);
                                  updateObjectProperty('ry', val);
                                }}
                                className="w-full accent-indigo-600"
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Độ dày viền</label>
                              <span className="text-[10px] text-zinc-400">{selectedObject.strokeWidth}px</span>
                            </div>
                            <input 
                              type="range" min="0" max="20" step="1"
                              value={selectedObject.strokeWidth}
                              onChange={(e) => updateObjectProperty('strokeWidth', Number(e.target.value))}
                              className="w-full accent-indigo-600"
                            />
                          </div>
                          {selectedObject.strokeWidth > 0 && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Màu viền</label>
                              <input 
                                type="color" 
                                value={selectedObject.stroke as string}
                                onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                                className="w-full h-8 rounded-lg bg-transparent border-none cursor-pointer"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="p-4 bg-black/20 rounded-2xl space-y-4">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Danh sách lớp</p>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {fabricCanvas.getObjects().slice().reverse().map((obj, idx) => {
                          const isSelected = selectedObject === obj;
                          const isObjLocked = !!obj.lockMovementX;
                          let icon = <FileImage className="w-3 h-3" />;
                          let name = "Hình ảnh";
                          
                          if (obj instanceof IText) {
                            icon = <Type className="w-3 h-3" />;
                            name = (obj as IText).text?.substring(0, 15) || "Văn bản";
                          } else if (obj instanceof Rect) {
                            icon = <Square className="w-3 h-3" />;
                            name = "Hình chữ nhật";
                          } else if (obj instanceof Circle) {
                            icon = <CircleIcon className="w-3 h-3" />;
                            name = "Hình tròn";
                          } else if (obj instanceof Triangle) {
                            icon = <TriangleIcon className="w-3 h-3" />;
                            name = "Hình tam giác";
                          }

                          return (
                            <div 
                              key={idx}
                              onClick={() => {
                                fabricCanvas.setActiveObject(obj);
                                fabricCanvas.renderAll();
                              }}
                              className={`group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer border ${
                                isSelected 
                                  ? 'bg-indigo-600/20 border-indigo-500/30' 
                                  : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                  {icon}
                                </div>
                                <span className={`text-[10px] font-medium truncate max-w-[80px] ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                  {name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    obj.bringForward();
                                    fabricCanvas.renderAll();
                                    saveHistory();
                                    triggerRefresh();
                                  }}
                                  className="p-1.5 hover:bg-white/10 rounded-md text-zinc-500 hover:text-white transition-colors"
                                  title="Lên trên"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    obj.sendBackwards();
                                    fabricCanvas.renderAll();
                                    saveHistory();
                                    triggerRefresh();
                                  }}
                                  className="p-1.5 hover:bg-white/10 rounded-md text-zinc-500 hover:text-white transition-colors"
                                  title="Xuống dưới"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newLock = !isObjLocked;
                                    obj.set({
                                      lockMovementX: newLock,
                                      lockMovementY: newLock,
                                      lockScalingX: newLock,
                                      lockScalingY: newLock,
                                      lockRotation: newLock,
                                      hasControls: !newLock,
                                    });
                                    if (isSelected) setIsLocked(newLock);
                                    fabricCanvas.renderAll();
                                    saveHistory();
                                    triggerRefresh();
                                  }}
                                  className={`p-1.5 rounded-md transition-colors ${isObjLocked ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-500 hover:text-white hover:bg-white/10'}`}
                                  title={isObjLocked ? "Mở khóa" : "Khóa"}
                                >
                                  {isObjLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 bg-black/20 rounded-2xl space-y-4">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quản lý lớp</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={bringToFront}
                          className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-medium transition-all"
                        >
                          <ArrowUp className="w-4 h-4" />
                          Lên trên
                        </button>
                        <button 
                          onClick={sendToBack}
                          className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-medium transition-all"
                        >
                          <ArrowDown className="w-4 h-4" />
                          Xuống dưới
                        </button>
                        <button 
                          onClick={duplicateSelected}
                          className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-medium transition-all"
                        >
                          <Copy className="w-4 h-4" />
                          Nhân bản
                        </button>
                        <button 
                          onClick={deleteSelected}
                          className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl flex items-center justify-center gap-2 text-[10px] font-medium transition-all"
                        >
                          <Trash className="w-4 h-4" />
                          Xóa bỏ
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-12 text-zinc-600">
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Chọn đối tượng trên canvas để quản lý</p>
                    </div>
                    <button 
                      onClick={clearCanvas}
                      className="w-full py-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border border-red-500/20"
                    >
                      <Eraser className="w-4 h-4" />
                      Xóa toàn bộ canvas
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4">
            <Settings2 className="w-3 h-3" />
            Thông tin hệ thống
          </div>
          <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
            <p className="text-[11px] text-indigo-400 leading-relaxed">
              Ứng dụng do Huy Ngo Droppii tạo ra cho anh chị em dễ thiết kế banner đơn giản nhưng chuyên nghiệp
            </p>
          </div>
        </div>

        {/* Toggle Button - Desktop only */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#1a1a1e] border border-white/5 rounded-full items-center justify-center hover:bg-zinc-800 transition-colors z-30"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Toolbar */}
        <header className="h-14 md:h-16 border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-black text-xs md:text-sm tracking-tighter text-indigo-500 leading-none uppercase">HUYNGO-DROPPII</h1>
                <h2 className="font-bold text-[10px] md:text-xs tracking-tight whitespace-nowrap text-white/70 hidden sm:block">Studio Pro</h2>
              </div>
            </div>
            <div className="hidden md:block h-6 w-px bg-white/10" />
            
            {/* Desktop Project Name */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-xl border border-white/5">
              <Settings2 className="w-3 h-3 text-zinc-500" />
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-zinc-300 focus:outline-none w-32"
                placeholder="Tên dự án..."
              />
            </div>

            {/* Undo/Redo - Always visible */}
            <div className="flex bg-zinc-900 rounded-lg p-1">
              <button 
                onClick={undo}
                disabled={historyStep <= 0}
                className={`p-1.5 md:p-2 rounded-md transition-colors ${historyStep <= 0 ? 'text-zinc-700' : 'text-zinc-400 hover:bg-zinc-800'}`}
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button 
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className={`p-1.5 md:p-2 rounded-md transition-colors ${historyStep >= history.length - 1 ? 'text-zinc-700' : 'text-zinc-400 hover:bg-zinc-800'}`}
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <label className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-sm font-medium flex items-center gap-2 transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                Mở dự án
                <input type="file" className="hidden" accept=".json" onChange={loadProject} />
              </label>
              <button 
                onClick={saveProject}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                Lưu dự án
              </button>
            </div>
            
            {/* Export Menu - Always visible */}
            <div className="relative">
              <button 
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="px-4 md:px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">Xuất</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {exportMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-2 space-y-1">
                      {[1, 2, 3, 4].map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            exportImage(m);
                            setExportMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-indigo-600 rounded-xl transition-colors flex items-center justify-between group"
                        >
                          <span className="text-xs font-medium">Độ phân giải {m}x</span>
                          <span className="text-[10px] text-zinc-500 group-hover:text-white/70">
                            {canvasWidth * m}x{canvasHeight * m}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => setShowShortcuts(true)}
              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 transition-all"
              title="Hướng dẫn phím tắt"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 bg-[#0f0f12] relative overflow-auto flex flex-col items-center justify-center p-4 md:p-12 scrollbar-hide pattern-grid"
        >
          <div className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest opacity-40 pointer-events-none">
            <Maximize className="w-3 h-3" />
            Khu vực thiết kế ({canvasWidth}x{canvasHeight}) - {Math.round(zoomScale * 100)}%
          </div>

          {isMaskEditing && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-amber-500 text-black rounded-full shadow-2xl shadow-amber-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-tight">Chế độ chỉnh sửa Mask</span>
              </div>
              <div className="w-px h-4 bg-black/20" />
              <button 
                onClick={exitMaskEditMode}
                className="px-4 py-1 bg-black text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <Check className="w-3 h-3" />
                Xong
              </button>
            </div>
          )}
          
          <div 
            className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-white rounded-sm overflow-hidden border border-white/10 ring-1 ring-white/5 transition-all duration-300 ease-out"
          >
            {/* Corner Markers for better visibility */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-indigo-500/40 z-10" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-500/40 z-10" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-500/40 z-10" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-indigo-500/40 z-10" />
            
            <div className="canvas-checkerboard absolute inset-0 -z-10 opacity-[0.03]" />
            <canvas ref={canvasRef} />
          </div>

          {/* Floating Toolbar for Selected Object - Canva Style Contextual Bottom Bar on Mobile */}
          <AnimatePresence>
            {toolbarPos && !isMaskEditing && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  left: isMobile ? '50%' : toolbarPos.x,
                  top: isMobile ? 'auto' : toolbarPos.y,
                  bottom: isMobile ? 84 : 'auto'
                }}
                exit={{ opacity: 0, y: 50 }}
                className={`${isMobile ? 'fixed' : 'absolute'} z-40 -translate-x-1/2 flex items-center gap-1 p-2 bg-[#1a1a1e] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl max-w-[95vw] overflow-x-auto no-scrollbar`}
              >
                  {isMaskPair && (
                    <>
                      <button 
                        onClick={applyMask}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-[10px] font-bold"
                        title="Tạo Mask"
                      >
                        <Scissors className="w-4 h-4" />
                        Tạo Mask
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                    </>
                  )}
                  {isMaskedObject && (
                    <>
                      <button 
                        onClick={() => {
                          if (selectedObject instanceof FabricImage) {
                            enterMaskEditMode(selectedObject as FabricImage);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all text-[10px] font-bold"
                        title="Chỉnh sửa Mask"
                      >
                        <Scissors className="w-4 h-4" />
                        Sửa Mask
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                    </>
                  )}
                  <button 
                    onClick={() => updateObjectProperty('lock', !isLocked)}
                    className={`p-2 rounded-lg transition-colors ${isLocked ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}
                    title={isLocked ? "Mở khóa" : "Khóa"}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button 
                    onClick={bringForward}
                    className="p-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    title="Lên 1 lớp"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={sendBackwards}
                    className="p-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    title="Xuống 1 lớp"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button 
                    onClick={copySelected}
                    className="p-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    title="Sao chép"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={duplicateSelected}
                    className="p-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded-lg transition-colors"
                    title="Nhân bản"
                  >
                    <Layers2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button 
                    onClick={deleteSelected}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Project Name Modal */}
            <AnimatePresence>
              {showProjectNameModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-md bg-[#1a1a1e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-8 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Đặt tên cho dự án</h3>
                        <p className="text-sm text-zinc-400">Vui lòng nhập tên để lưu dự án của bạn.</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tên dự án</label>
                          <input 
                            type="text"
                            autoFocus
                            value={tempProjectName}
                            onChange={(e) => setTempProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmProjectName()}
                            className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                            placeholder="Ví dụ: Banner khuyến mãi..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button 
                          onClick={() => setShowProjectNameModal(false)}
                          className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={confirmProjectName}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
                        >
                          Lưu ngay
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Shortcuts Guide Modal */}
            <AnimatePresence>
              {showShortcuts && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowShortcuts(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-[#1a1a1e] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <h2 className="text-lg font-bold">Hướng dẫn phím tắt</h2>
                      <button onClick={() => setShowShortcuts(false)} className="p-2 hover:bg-white/5 rounded-full">
                        <Plus className="w-5 h-5 rotate-45" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        { keys: ['Ctrl', 'Z'], desc: 'Hoàn tác (Undo)' },
                        { keys: ['Ctrl', 'Y'], desc: 'Làm lại (Redo)' },
                        { keys: ['Ctrl', 'C'], desc: 'Sao chép' },
                        { keys: ['Ctrl', 'V'], desc: 'Dán / Nhân bản' },
                        { keys: ['Ctrl', 'S'], desc: 'Lưu dự án' },
                        { keys: ['Ctrl', 'L'], desc: 'Khóa / Mở khóa' },
                        { keys: ['Del'], desc: 'Xóa đối tượng' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-zinc-400">{item.desc}</span>
                          <div className="flex gap-1">
                            {item.keys.map((key, ki) => (
                              <kbd key={ki} className="px-2 py-1 bg-zinc-800 border border-white/10 rounded text-[10px] font-mono text-zinc-200 min-w-[30px] text-center">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-indigo-600/5 border-t border-white/5">
                      <p className="text-[11px] text-zinc-500 text-center italic">
                        Mẹo: Giữ Shift khi chọn để chọn nhiều đối tượng cùng lúc.
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Mobile Bottom Navigation - Canva Style */}
            <div className="md:hidden fixed bottom-0 inset-x-0 h-20 bg-[#1a1a1e] border-t border-white/5 flex items-center justify-between px-4 z-[90] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <div className="flex flex-1 justify-around items-center">
                {[
                  { id: 'size', icon: Maximize, label: 'Cỡ' },
                  { id: 'text', icon: Type, label: 'Chữ' },
                  { id: 'layers', icon: Layers, label: 'Lớp' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setSidebarOpen(true);
                    }}
                    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
                      activeTab === item.id && sidebarOpen ? 'text-indigo-400' : 'text-zinc-500'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Canva Style Plus Button */}
              <button 
                onClick={() => {
                  if (!sidebarOpen) {
                    setActiveTab('image');
                    setSidebarOpen(true);
                  } else {
                    setSidebarOpen(false);
                  }
                }}
                className="relative -top-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/40 border-4 border-[#0f0f12] active:scale-90 transition-transform z-[100]"
              >
                <Plus className={`w-8 h-8 text-white transition-transform duration-300 ${sidebarOpen ? 'rotate-45' : ''}`} />
              </button>

              <div className="flex flex-1 justify-around items-center">
                {[
                  { id: 'image', icon: ImageIcon, label: 'Ảnh' },
                  { id: 'shapes', icon: SquareIcon, label: 'Hình' },
                  { id: 'menu', icon: Menu, label: 'Thêm' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'menu') {
                        setShowMobileMenu(true);
                      } else {
                        setActiveTab(item.id as any);
                        setSidebarOpen(true);
                      }
                    }}
                    className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
                      (activeTab === item.id || (item.id === 'menu' && showMobileMenu)) && sidebarOpen ? 'text-indigo-400' : 'text-zinc-500'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile More Menu Modal */}
            <AnimatePresence>
              {showMobileMenu && (
                <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="w-full bg-[#1a1a1e] rounded-t-3xl overflow-hidden shadow-2xl"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-lg font-bold">Menu mở rộng</h3>
                      <button onClick={() => setShowMobileMenu(false)} className="p-2 bg-white/5 rounded-full">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 grid grid-cols-3 gap-4">
                      {[
                        { id: 'banners', icon: Layout, label: 'Mẫu Banner' },
                        { id: 'frame', icon: Frame, label: 'Khung hình' },
                        { id: 'layers', icon: Layers, label: 'Lớp đối tượng' },
                        { id: 'size', icon: Settings2, label: 'Cài đặt canvas' },
                        { id: 'export', icon: Download, label: 'Xuất ảnh', action: () => setExportMenuOpen(true) },
                        { id: 'save', icon: Save, label: 'Lưu dự án', action: saveProject },
                        { id: 'open', icon: Upload, label: 'Mở dự án', action: () => document.getElementById('mobile-project-upload')?.click() },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.action) {
                              item.action();
                            } else {
                              setActiveTab(item.id as any);
                              setSidebarOpen(true);
                            }
                            setShowMobileMenu(false);
                          }}
                          className="flex flex-col items-center gap-2 p-4 bg-zinc-900 rounded-2xl hover:bg-indigo-600/20 transition-all"
                        >
                          <item.icon className="w-6 h-6 text-indigo-400" />
                          <span className="text-[10px] font-medium text-center">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <input type="file" id="mobile-project-upload" className="hidden" accept=".json" onChange={loadProject} />
                    <div className="h-8" /> {/* Safe area spacer */}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Bar */}
          <footer className="h-10 border-t border-white/5 bg-[#0f0f12] flex items-center justify-between px-6 text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Move className="w-3 h-3" /> Sẵn sàng</span>
              <span className="flex items-center gap-1.5"><FileImage className="w-3 h-3" /> {canvasWidth} x {canvasHeight} px</span>
            </div>
            <div>Phiên bản 1.1.0 • Client-side Processing</div>
          </footer>
        </main>

        <style dangerouslySetInnerHTML={{ __html: `
          .pattern-grid {
            background-image: radial-gradient(#ffffff08 1px, transparent 1px);
            background-size: 32px 32px;
          }
          .canvas-checkerboard {
            background-image: linear-gradient(45deg, #000 25%, transparent 25%), 
                              linear-gradient(-45deg, #000 25%, transparent 25%), 
                              linear-gradient(45deg, transparent 75%, #000 75%), 
                              linear-gradient(-45deg, transparent 75%, #000 75%);
            background-size: 20px 20px;
            background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          }
          canvas {
            box-shadow: 0 0 40px rgba(0,0,0,0.3);
          }
          .canvas-container {
            margin: 0 auto !important;
          }
        `}} />
      </div>
    );
  }
