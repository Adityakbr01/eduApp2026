import { ContentType, ILessonContent } from "@/services/courses/types";

  const getCurrentFileUrl = ({content}: {content: ILessonContent}) => {
    if (content.type === ContentType.VIDEO) return content.video?.url;
    if (content.type === ContentType.AUDIO) return content.audio?.url;
    if (content.type === ContentType.PDF) return content.pdf?.url;
    return undefined;
  };


  export default getCurrentFileUrl;