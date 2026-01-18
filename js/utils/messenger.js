// Утилиты для работы с мессенджерами и почтой

export function generateMessageText(request, club) {
    const lines = [
        `Здравствуйте! Хочу записаться в кружок "${club.title}" (школа №11).`,
        `Заявка №${request.id}.`,
        `Контакты: ${request.phone}, ${request.email}.`,
    ];

    if (request.childName) {
        lines.push(`Ребёнок: ${request.childName}`);
        if (request.childClass || request.childAge) {
            const childInfo = [];
            if (request.childClass) childInfo.push(`${request.childClass} класс`);
            if (request.childAge) childInfo.push(`${request.childAge} лет`);
            lines.push(childInfo.join(', '));
        }
    }

    if (request.comment) {
        lines.push(`Комментарий: ${request.comment}`);
    }

    return lines.join('\n');
}

export function openMailto(request, club) {
    const subject = encodeURIComponent(`Заявка №${request.id} - ${club.title}`);
    const body = encodeURIComponent(generateMessageText(request, club));
    window.location.href = `mailto:school11@example.ru?subject=${subject}&body=${body}`;
}

export function openTelegram(request, club) {
    const text = encodeURIComponent(generateMessageText(request, club));
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
}

export function openWhatsApp(request, club) {
    const text = encodeURIComponent(generateMessageText(request, club));
    window.open(`https://wa.me/79951234567?text=${text}`, '_blank');
}

export function openViber(request, club) {
    const text = encodeURIComponent(generateMessageText(request, club));
    window.open(`viber://forward?text=${text}`, '_blank');
}

export function openVK(request, club) {
    const text = encodeURIComponent(generateMessageText(request, club));
    window.open(`https://vk.com/share.php?url=&title=Заявка%20№${request.id}&description=${text}`, '_blank');
}

export async function shareViaWebAPI(request, club) {
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Заявка №${request.id} - ${club.title}`,
                text: generateMessageText(request, club),
                url: window.location.href,
            });
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
            return false;
        }
    }
    return false;
}

export function copyToClipboard(text) {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text).then(
            () => true,
            () => false
        );
    } else {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return Promise.resolve(true);
        } catch {
            document.body.removeChild(textarea);
            return Promise.resolve(false);
        }
    }
}

