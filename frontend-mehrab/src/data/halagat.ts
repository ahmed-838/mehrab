export interface Sheikh {
  _id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
}

export interface HalaqaSession {
  _id: string;
  title: string;
  description: string;
  sheikh: Sheikh;
  startTime: string;
  endTime: string;
  participantsCount: number;
  maxParticipants: number;
}

export const mockData: HalaqaSession[] = [
  {
    _id: "1",
    title: "حلقة تحفيظ سورة البقرة",
    description: "حلقة أسبوعية لتحفيظ سورة البقرة مع التفسير المبسط",
    sheikh: {
      _id: "s1",
      name: "الشيخ أحمد محمود",
      specialty: "حفظ وتجويد",
      imageUrl: "/images/sheikh1.jpg"
    },
    startTime: "2023-10-15T18:00:00",
    endTime: "2023-10-15T19:30:00",
    participantsCount: 12,
    maxParticipants: 20
  },
  {
    _id: "2",
    title: "حلقة تجويد للمبتدئين",
    description: "تعلم أساسيات التجويد وأحكام النون الساكنة والتنوين",
    sheikh: {
      _id: "s2",
      name: "الشيخ محمد عبد الرحمن",
      specialty: "تجويد",
      imageUrl: "/images/sheikh2.jpg"
    },
    startTime: "2023-10-16T17:00:00",
    endTime: "2023-10-16T18:30:00",
    participantsCount: 8,
    maxParticipants: 15
  },
  {
    _id: "3",
    title: "حلقة تفسير جزء عم",
    description: "تفسير مفصل لسور جزء عم مع استخراج الدروس والعبر",
    sheikh: {
      _id: "s3",
      name: "الشيخ عبد الله الفاضل",
      specialty: "تفسير",
      imageUrl: "/images/sheikh3.jpg"
    },
    startTime: "2023-10-17T19:00:00",
    endTime: "2023-10-17T20:30:00",
    participantsCount: 15,
    maxParticipants: 25
  }
];
  