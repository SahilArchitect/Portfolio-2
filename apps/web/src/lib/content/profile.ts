import { hasTodo, type ProfileData } from './schemas';

/** Strip anything the public must not see: TODO values, an unreviewed bio, a hidden location. */
export function visibleProfile(profile: ProfileData): ProfileData {
  const clean = (value: string | undefined) => (value && !hasTodo(value) ? value : '');
  return {
    ...profile,
    researchStatement: clean(profile.researchStatement),
    bioMarkdown: profile.bioReviewed ? clean(profile.bioMarkdown) : '',
    interests: profile.interests.filter((item) => !hasTodo(item)),
    skills: profile.skills.filter((item) => !hasTodo(item)),
    email: clean(profile.email),
    githubUrl: clean(profile.githubUrl),
    scholarUrl: clean(profile.scholarUrl),
    orcidUrl: clean(profile.orcidUrl),
    linkedinUrl: clean(profile.linkedinUrl),
    location: profile.showLocation ? clean(profile.location) : '',
  };
}
