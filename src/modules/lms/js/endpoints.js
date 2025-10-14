export const lmsEndpoints = {
    lms: {
        // Пользователи и профили
        profiles: 'lms/profiles/',
        myProfile: 'lms/profile/me/',
        userRoles: 'lms/user/roles/',
        switchRole: 'lms/user/roles/switch/',
        
        // Курсы
        categories: 'lms/categories/',
        deleteCategory: id => `lms/categories/${id}/`,
        courseFormats: 'lms/course-formats/',
        deleteCourseFormat: id => `lms/course-formats/${id}/`,
        subjects: 'lms/subjects/',
        enrollments: 'lms/enrollments/',
        
        // Темы курсов
        themes: 'lms/themes/',
        reorderLessons: id => `lms/themes/${id}/reorder-lessons/`,
        reorderThemes: 'lms/themes/reorder-themes/',
        
        // Уроки
        lessons: 'lms/lessons/',
        duplicateLesson: id => `lms/lessons/${id}/duplicate/`,
        toggleLessonVisibility: id => `lms/lessons/${id}/toggle-visibility/`,
        lessonsByCourse: 'lms/lessons/by-course/',
        
        // Ресурсы
        resources: 'lms/resources/',
        downloadResource: id => `lms/resources/${id}/download/`,
        toggleResourceVisibility: id => `lms/resources/${id}/toggle-visibility/`,
        resourcesByContext: 'lms/resources/by-context/',
        
        // Записи на курсы
        enroll: id => `lms/subjects/${id}/enroll/`,
        unenroll: id => `lms/subjects/${id}/unenroll/`,
        enrolledStudents: id => `lms/subjects/${id}/students/`,
        duplicateSubject: id => `lms/subjects/${id}/duplicate/`,
        toggleSubjectPublished: id => `lms/subjects/${id}/toggle-published/`,
        subjectStructure: id => `lms/subjects/${id}/structure/`,
        
        // Тестирование
        testBanks: 'lms/test-banks/',
        tests: 'lms/tests/',
        testAttempts: 'lms/test-attempts/',
        startTest: id => `lms/tests/${id}/start/`,
        
        // Задания
        assignments: 'lms/assignments/',
        submittedAssignments: 'lms/submitted-assignments/',
        
        // Форумы
        forums: 'lms/forums/',
        discussions: 'lms/discussions/',
        posts: 'lms/posts/',
        
        // Календарь
        calendar: 'lms/calendar/',
        upcomingEvents: 'lms/calendar/upcoming/',
        
        // Значки и достижения
        badges: 'lms/badges/',
        userBadges: 'lms/user-badges/',
        
        // Уведомления
        notifications: 'lms/notifications/',
        markAsRead: id => `lms/notifications/${id}/read/`,
        markAllAsRead: 'lms/notifications/read-all/',
        
        // Личные сообщения
        messages: 'lms/messages/',
        
        // Оценки
        grades: 'lms/grades/',
        
        // Аналитика
        studentStats: 'lms/analytics/student/',
        teacherStats: 'lms/analytics/teacher/',
        dashboard: 'lms/analytics/dashboard/',
        
        // Элементы урока
        lessonItems: 'lms/lesson-items/by-lesson/',
        reorderLessonItems: 'lms/lesson-items/reorder/',
        migrateLessonItems: 'lms/lesson-items/migrate/',
        
        // Вопросы и ответы
        questions: 'lms/questions/',
        questionDetail: id => `lms/questions/${id}/`,
        answers: 'lms/answers/',
        answerDetail: id => `lms/answers/${id}/`,
        
        // Аналитика прогресса
        studentProgress: 'lms/analytics/student/progress/'
    }
};

