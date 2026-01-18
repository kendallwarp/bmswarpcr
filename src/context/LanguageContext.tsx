import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const translations = {
    en: {
        // Sidebar
        'sidebar.new_post': 'New Post',
        'sidebar.import_csv': 'Import CSV',
        'nav.calendar': 'Calendar',
        'nav.posts': 'Posts',
        'nav.import': 'Import CSV',
        'nav.backup': 'Backup / Restore',
        'btn.new_post': 'New Post',
        'btn.update_post': 'Update Post',
        'btn.delete': 'Delete',
        'btn.cancel': 'Cancel',
        'btn.save': 'Save',
        'btn.edit': 'Edit',
        'btn.clear_all': 'Reset Data',

        // Export
        'export.title': 'Export Report',
        'export.generate': 'Generate PDF',
        'export.brand': 'Brand',
        'export.brand_all': 'All Brands',
        'export.start_date': 'Start Date',
        'export.end_date': 'End Date',

        // Filter
        'filter.search': 'Search copy or objective...',
        'filter.platform': 'Platform',
        'filter.brand': 'Brand',
        'filter.status': 'Status',
        'filter.clear': 'Clear Filters',
        'filter.all': 'All',

        // Calendar
        'cal.today': 'Today',
        'cal.prev': 'Prev',
        'cal.next': 'Next',
        'cal.view_grid': 'Grid View',
        'cal.view_list': 'List View',
        'cal.view_day': 'Day',
        'cal.view_week': 'Week',
        'cal.view_month': 'Month',

        // Status
        'status.draft': 'Draft',
        'status.scheduled': 'Scheduled',
        'status.approved': 'Approved',
        'status.published': 'Published',
        'status.posted': 'Posted',

        // List View
        'list.date': 'Date',
        'list.img': 'Img',
        'list.platform': 'Platform',
        'list.brand': 'Brand',
        'list.info': 'Info',
        'list.copy': 'Copy',
        'list.status': 'Status',
        'list.action': 'Action',
        'list.select_all': 'Select All',
        'list.selected': 'selected',
        'list.set_status': 'Set Status...',
        'list.no_posts': 'No posts found to list.',

        // Alerts
        'alert.copy_success': 'Copy copied to clipboard!',
        'alert.save_failed': 'Failed to save post. Please try again.',
        'alert.post_saved': 'Post saved successfully!',
        'alert.fill_required': 'Please fill in Objective and Copy fields.',
        'alert.image_failed': 'Image compression failed',
        'alert.bulk_delete_error': 'Failed to delete posts',
        'alert.bulk_status_error': 'Failed to update status',

        // Confirm
        'confirm.bulk_delete': 'Are you sure you want to delete {count} posts?',

        // Form
        'form.date': 'Date',
        'form.time': 'Time',
        'form.platform': 'Platform',
        'form.brand': 'Brand',
        'form.objective': 'Objective',
        'form.status': 'Status',
        'form.copy': 'Copy / Caption',
        'form.image': 'Image',
        'form.paid': 'Paid Promotion',
        'form.budget': 'Budget',
        'form.drag_drop': 'Drag & Drop or Click to Upload',

        // Import
        'import.title': 'Import Content',
        'import.drag': 'Drop CSV file here or click to upload',
        'import.columns': 'Columns: date, time, platform, objective, status, isPaid, copy, imageURL, brand',
        'import.download_template': 'Download Example Template',
        'import.back': 'Back',
        'import.import_btn': 'Import',
        'import.errors': 'Validation Errors',
        'import.success_message': 'Successfully imported {count} posts!',
        'import.error_saving': 'Error saving import data. Please check connection and try again.',

        // PDF
        'pdf.generated': 'Generated',
        'pdf.content_details': 'Content Details',
        'pdf.report_for': 'Report for {brand}',
        'pdf.social_plan': 'Social Media Plan',
        'pdf.no_preview': 'No Preview',
        'pdf.organic': 'Organic',
        'pdf.paid': 'PAID',
        'pdf.objective_short': 'Obj',

        // Common
        'common.date': 'Date',
        'common.at': 'at',
        'common.no_image': 'No Image',
        'common.no_objective': 'No Objective',
        'common.no_copy': 'No copy...',
        'common.type': 'Type',
    },
    es: {
        // Sidebar
        'sidebar.new_post': 'Nueva Publicación',
        'sidebar.import_csv': 'Importar CSV',
        'nav.calendar': 'Calendario',
        'nav.posts': 'Publicaciones',
        'nav.import': 'Importar CSV',
        'nav.backup': 'Respaldo / Restaurar',
        'btn.new_post': 'Nueva Publicación',
        'btn.update_post': 'Actualizar',
        'btn.delete': 'Eliminar',
        'btn.cancel': 'Cancelar',
        'btn.save': 'Guardar',
        'btn.edit': 'Editar',
        'btn.clear_all': 'Resetear Datos',

        // Export
        'export.title': 'Exportar Reporte',
        'export.generate': 'Generar PDF',
        'export.brand': 'Marca',
        'export.brand_all': 'Todas las Marcas',
        'export.start_date': 'Fecha Inicio',
        'export.end_date': 'Fecha Fin',

        // Filter
        'filter.search': 'Buscar copy u objetivo...',
        'filter.platform': 'Plataforma',
        'filter.brand': 'Marca',
        'filter.status': 'Estado',
        'filter.clear': 'Limpiar Filtros',
        'filter.all': 'Todos',

        // Calendar
        'cal.today': 'Hoy',
        'cal.prev': 'Ant',
        'cal.next': 'Sig',
        'cal.view_grid': 'Vista Cuadrícula',
        'cal.view_list': 'Vista Lista',
        'cal.view_day': 'Día',
        'cal.view_week': 'Semana',
        'cal.view_month': 'Mes',

        // Status
        'status.draft': 'Borrador',
        'status.scheduled': 'Programado',
        'status.approved': 'Aprobado',
        'status.published': 'Publicado',
        'status.posted': 'Posteado',

        // List View
        'list.date': 'Fecha',
        'list.img': 'Img',
        'list.platform': 'Plataforma',
        'list.brand': 'Marca',
        'list.info': 'Info',
        'list.copy': 'Texto',
        'list.status': 'Estado',
        'list.action': 'Acción',
        'list.select_all': 'Seleccionar Todo',
        'list.selected': 'seleccionados',
        'list.set_status': 'Cambiar Estado...',
        'list.no_posts': 'No se encontraron publicaciones.',

        // Alerts
        'alert.copy_success': '¡Texto copiado al portapapeles!',
        'alert.save_failed': 'Error al guardar. Inténtalo de nuevo.',
        'alert.post_saved': '¡Publicación guardada exitosamente!',
        'alert.fill_required': 'Por favor completa el Objetivo y el Texto.',
        'alert.image_failed': 'Error al comprimir imagen',
        'alert.bulk_delete_error': 'Error al eliminar publicaciones',
        'alert.bulk_status_error': 'Error al actualizar estados',

        // Confirm
        'confirm.bulk_delete': '¿Estás seguro de eliminar {count} publicaciones?',

        // Form
        'form.date': 'Fecha',
        'form.time': 'Hora',
        'form.platform': 'Plataforma',
        'form.brand': 'Marca',
        'form.objective': 'Objetivo',
        'form.status': 'Estado',
        'form.copy': 'Copy / Descripción',
        'form.image': 'Imagen',
        'form.paid': 'Promoción Pagada',
        'form.budget': 'Presupuesto',
        'form.drag_drop': 'Arrastra o Clic para Subir',

        // Import
        'import.title': 'Importar Contenido',
        'import.drag': 'Arrastra el archivo CSV aquí o clic para subir',
        'import.columns': 'Columnas: date, time, platform, objective, status, isPaid, copy, imageURL, brand',
        'import.download_template': 'Descargar Plantilla Ejemplo',
        'import.back': 'Atrás',
        'import.import_btn': 'Importar',
        'import.errors': 'Errores de Validación',
        'import.success_message': '¡{count} publicaciones importadas con éxito!',
        'import.error_saving': 'Error al guardar. Verifica tu conexión e intenta de nuevo.',

        // PDF
        'pdf.generated': 'Generado',
        'pdf.content_details': 'Detalles de Contenido',
        'pdf.report_for': 'Reporte para {brand}',
        'pdf.social_plan': 'Plan de Redes Sociales',
        'pdf.no_preview': 'Sin Vista Previa',
        'pdf.organic': 'Orgánico',
        'pdf.paid': 'PAGADO',
        'pdf.objective_short': 'Obj',

        // Common
        'common.date': 'Fecha',
        'common.at': 'a las',
        'common.no_image': 'Sin Imagen',
        'common.no_objective': 'Sin Objetivo',
        'common.no_copy': 'Sin texto...',
        'common.type': 'Tipo',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('app-language');
        return (saved as Language) || 'es'; // Default to Spanish as requested implying strong Spanish preference
    });

    useEffect(() => {
        localStorage.setItem('app-language', language);
    }, [language]);

    const t = (key: string, params?: Record<string, string | number>): string => {
        // @ts-ignore
        let text = translations[language][key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};

// Also export the translation object for non-hook usage (like PDF generator if needed, though clean way is passing strings)
export const getTranslation = (lang: Language, key: string) => {
    // @ts-ignore
    return translations[lang][key] || key;
};
