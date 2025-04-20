const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  description: {
    opacity: 0.7,
  },
  categoryCard: {
    marginBottom: 16,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    // Add a subtle background color or shadow to make it stand out
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoPreview: {
    flexDirection: 'row',
    marginTop: 16,
  },
  demoButton: {
    marginRight: 12,
  },
  viewDemoButton: {
    marginTop: 8,
  },
  themeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  themeItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeColor: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  docLinks: {
    marginTop: 16,
  },
  docLink: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
  },
  copyright: {
    opacity: 0.5,
    marginTop: 4,
  },
});
